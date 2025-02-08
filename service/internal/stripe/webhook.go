package stripe

import (
	"errors"
	"fmt"
	"log"

	"github.com/qbaware/kosher/internal/constants"
	"github.com/stripe/stripe-go/v74"
	stripeCustomer "github.com/stripe/stripe-go/v74/customer"
	stripeSubscription "github.com/stripe/stripe-go/v74/subscription"
	"github.com/stripe/stripe-go/v74/webhook"
)

const (
	WebhookSignatureHeader = "Stripe-Signature"

	unrelatedEventContent = "unrelated_event_content"
)

// WebhookHandler handles parsing the contents of Stripe webhooks.
type WebhookHandler struct {
	signSecret string
}

// NewWebhookHandler creates a webhook handler object.
func NewWebhookHandler(stripeKey string, signSecret string) WebhookHandler {
	stripe.Key = stripeKey

	return WebhookHandler{
		signSecret: signSecret,
	}
}

// ParseSubscriptionWebhookContent parses a Stripe webhook's content and returns a customer's subscription plan, the customer's email, or an error in case something happens.
func (wh WebhookHandler) ParseSubscriptionWebhookContent(content []byte, signature string) (string, string, error) {
	event, err := webhook.ConstructEvent(content, signature, wh.signSecret)
	if err != nil {
		log.Printf("Error verifying webhook signature: %v", err)
		return "", "", errors.New(fmt.Sprintf("error verifying content signature: %s", err))
	}

	log.Printf("Processing webhook event type: '%+v'...", event.Type)

	var sub *stripe.Subscription
	var cust *stripe.Customer

	switch event.Type {
	case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
		eventData := event.Data.Object

		subscriptionID := eventData["id"].(string)
		customerID := eventData["customer"].(string)
		log.Printf("Processing subscription '%s' for customer '%s'...", subscriptionID, customerID)

		sub, err = stripeSubscription.Get(subscriptionID, nil)
		if err != nil {
			log.Printf("Error getting subscription: %s", err)
			return "", "", errors.New(fmt.Sprintf("error getting subscription: %s", err))
		}

		cust, err = stripeCustomer.Get(customerID, nil)
		if err != nil {
			log.Printf("Error getting customer: %s", err)
			return "", "", errors.New(fmt.Sprintf("error getting customer: %s", err))
		}

		if cust.Deleted {
			log.Printf("Customer %s is deleted", cust.Email)
			return "", "", errors.New(fmt.Sprintf("customer %s is deleted: %s", cust.Email, err))
		}

		if sub.CanceledAt != 0 {
			return constants.FreeSubscription, cust.Email, nil
		}

		if sub.Items.Data[0].Plan.Amount == premiumPlanAmount {
			return constants.PremiumSubscription, cust.Email, nil
		}

		if sub.Items.Data[0].Plan.Amount == freePlanAmount {
			return constants.FreeSubscription, cust.Email, nil
		}

		log.Printf("Subscription is not recognized")
		return constants.UnknownSubscription, cust.Email, nil
	}

	return constants.UnknownSubscription, "", nil
}
