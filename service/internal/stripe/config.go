package stripe

// Config contains some Stripe configs necessary to successfully interact with Stripe webhooks.
type Config struct {
	StripeKey         string
	WebhookSignSecret string
}
