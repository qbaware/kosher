package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/service"
	"github.com/stripe/stripe-go/v74"
)

// NewPostSubscriptionWebhooksHandler handles all incoming webhooks from the subscription system.
func NewPostSubscriptionWebhooksHandler(u service.UserService) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		payload, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading request body for subscription webhook: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		event := stripe.Event{}

		if err := json.Unmarshal(payload, &event); err != nil {
			log.Printf("Failed to parse webhook body json: %v", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		var newSub string
		switch event.Type {
		case "customer.subscription.created":
			// Then define and call a function to handle the event customer.subscription.created
		case "customer.subscription.updated":
			// Then define and call a function to handle the event customer.subscription.updated
		case "customer.subscription.deleted":
			// Then define and call a function to handle the event customer.subscription.deleted
			log.Printf("Received a familiar event: '%+v'", event)
		default:
			log.Printf("Received an event for which we don't care at all: %s", event.Type)
			w.WriteHeader(http.StatusOK)
			return
		}

		user := r.Context().Value(middleware.UserKey{}).(models.User)

		if newSub == "" {
			log.Printf("Failed to update subscription for user '%s'", user.Email)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err = u.UpsertSubscription(user.ID, newSub)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
