package storage

// UserStorage describes a browser storage.
type UserStorage interface {

	// GetSubscription retrieves a user's subscription.
	GetSubscription(userID string) (string, error)

	// SetSubscription sets a user's subscription.
	SetSubscription(userID string, subscription string) error
}
