package api

import (
	"io"
	"log"
	"net/http"

	"github.com/qbaware/kosher/internal/service"
	"github.com/qbaware/kosher/internal/stripe"
)

// NewPostSubscriptionWebhookHandler handles all incoming webhooks from the payment and subscription provider.
func NewPostSubscriptionWebhookHandler(u service.UserService, stripeWebhookConfig stripe.Config) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		payload, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading request body for subscription webhook: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		whHandler := stripe.NewWebhookHandler(stripeWebhookConfig.StripeKey, stripeWebhookConfig.WebhookSignSecret)
		subscriptionPlan, customerEmail, err := whHandler.ParseSubscriptionWebhookContent(payload, r.Header.Get(stripe.WebhookSignatureHeader))
		if err != nil {
			log.Printf("Error while parsing Stripe webhood content")
		}

		user, err := u.GetUserByEmail(customerEmail)
		if err != nil {
			log.Printf("Error finding the user corresponding to customer '%+v': %s", customerEmail, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		log.Printf("Updating user '%s' with subscription '%s'...", user.ID, subscriptionPlan)
		err = u.UpsertSubscription(user.ID, subscriptionPlan)
		if err != nil {
			log.Printf("Error updating the user's subscription: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
