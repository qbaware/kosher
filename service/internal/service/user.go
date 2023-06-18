package service

import (
	"sync"

	"github.com/qbaware/kosher/internal/constants"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// UserService describes a user service.
type UserService interface {

	// GetUser retrieves a user.
	GetUser(userID string) (models.User, error)

	// GetUserByEmail retrieves a user by their email.
	GetUserByEmail(userEmail string) (models.User, error)

	// UpsertUser stores the user.
	UpsertUser(user models.User) error

	// UpsertSubscription updates a user's subscription.
	UpsertSubscription(userID string, subscription string) error
}

type userService struct {
	storage storage.UserStorage

	mutex sync.Mutex
}

var _ UserService = &userService{}

// NewUserService creates a new UserService.
func NewUserService(storage storage.UserStorage) UserService {
	return &userService{storage: storage}
}

// GetUser retrieves a user.
func (s *userService) GetUser(userID string) (models.User, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.storage.GetUser(userID)
}

// GetUserByEmail retrieves a user by their email.
func (s *userService) GetUserByEmail(userEmail string) (models.User, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.storage.GetUserByEmail(userEmail)
}

// UpsertUser stores the user.
func (s *userService) UpsertUser(user models.User) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if !user.IsValid() {
		return &InvalidUserError{}
	}

	return s.storage.UpsertUser(user)
}

// UpsertSubscription updates a user's subscription.
func (s *userService) UpsertSubscription(userID string, subscription string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if subscription != constants.FreeSubscription && subscription != constants.PremiumSubscription {
		return &InvalidSubscriptionValueError{}
	}

	return s.storage.UpsertSubscription(userID, subscription)
}
