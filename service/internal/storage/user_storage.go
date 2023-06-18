package storage

import "github.com/qbaware/kosher/internal/models"

// UserStorage describes a browser storage.
type UserStorage interface {

	// GetUser retrieves a user.
	GetUser(userID string) (models.User, error)

	// GetUserByEmail retrieves a user by their email.
	GetUserByEmail(userEmail string) (models.User, error)

	// UpsertUser stores the user.
	UpsertUser(user models.User) error

	// UpsertSubscription updates a user's subscription.
	UpsertSubscription(userID string, subscription string) error
}
