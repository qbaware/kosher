package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/qbaware/kosher/internal/constants"
	"github.com/qbaware/kosher/internal/service"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/webhook"
)

// NewPostSubscriptionWebhooksHandler handles all incoming webhooks from the subscription system.
func NewPostSubscriptionWebhooksHandler(u service.UserService) func(w http.ResponseWriter, r *http.Request) {
	// TODO: Remove this key from source code, lol. See if you can pass this via GH.
	stripe.Key = "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"

	return func(w http.ResponseWriter, r *http.Request) {
		payload, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading request body for subscription webhook: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		// TODO: Remove this key from source code, lol. See if you can pass this via GH.
		endpointSecret := "whsec_mnxqmiJ8xo3nKilKBixPhh8uPgACznSE"

		event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), endpointSecret)
		if err != nil {
			log.Printf("Error verifying webhook signature: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if err := json.Unmarshal(payload, &event); err != nil {
			log.Printf("Failed to parse webhook body json: %v", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		var customerEmail string
		var newSubscription string
		switch event.Type {
		case "customer.subscription.created":
		case "customer.subscription.updated":
		case "customer.subscription.deleted":
			var sub *stripe.Subscription
			if s, ok := event.Data.Object["object"].(*stripe.Subscription); !ok {
				log.Printf("Failed to parse subscription object from webhook")
				w.WriteHeader(http.StatusBadRequest)
				return
			} else {
				sub = s
			}

			customerEmail = sub.Customer.Email
			if sub.Customer.Deleted {
				log.Printf("Customer %s is deleted", customerEmail)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			if sub.CanceledAt != 0 {
				newSubscription = constants.FreeSubscription
				break
			}

			if sub.Items.Data[0].Plan.Amount == 100 {
				newSubscription = constants.PremiumSubscription
				break
			}

			if sub.Items.Data[0].Plan.Amount == 0 {
				newSubscription = constants.FreeSubscription
				break
			}

			log.Printf("Subscription is not recognized")
			w.WriteHeader(http.StatusBadRequest)
			return
		default:
			log.Printf("Received an event for which we don't care at all: %s", event.Type)
			w.WriteHeader(http.StatusOK)
			return
		}

		user, err := u.GetUserByEmail(customerEmail)
		if err != nil {
			log.Println("Error finding the user")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		err = u.UpsertSubscription(user.ID, newSubscription)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
