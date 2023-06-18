package api

import (
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
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: Remove this key from source code, lol. See if you can pass this via GH.
		stripe.Key = "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"

		payload, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading request body for subscription webhook: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		// TODO: Remove this key from source code, lol. See if you can pass this via GH.
		signSecret := "whsec_mnxqmiJ8xo3nKilKBixPhh8uPgACznSE"

		event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), signSecret)
		if err != nil {
			log.Printf("Error verifying webhook signature: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		var sub stripe.Subscription
		var newSubscription string

		switch event.Type {
		case "customer.subscription.created":
		case "customer.subscription.updated":
		case "customer.subscription.deleted":
			s, ok := event.Data.Object["object"].(stripe.Subscription)
			if !ok {
				log.Printf("Failed to parse subscription object '%+v' from webhook: %s", event.Data.Raw, err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			sub = s

			if sub.Customer.Deleted {
				log.Printf("Customer %s is deleted", sub.Customer.Email)
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

		user, err := u.GetUserByEmail("mazei gei")
		if err != nil {
			log.Printf("Error finding the user corresponding to subscription '%+v' with event '%+v': %s", sub, event, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		err = u.UpsertSubscription(user.ID, newSubscription)
		if err != nil {
			log.Printf("Error updating the user's subscription: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
