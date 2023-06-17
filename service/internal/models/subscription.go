package models

// Subscription represents a subscription.
type Subscription struct {
	ID     string `json:"id"` 
	UserID string `json:"user_id"`
	Plan   string `json:"plan"`
}
