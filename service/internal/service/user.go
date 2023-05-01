package service

import (
	"sync"

	"github.com/qbaware/kosher/internal/constants"
	"github.com/qbaware/kosher/internal/storage"
)

// UserService describes a user service.
type UserService interface {

	// GetSubscription retrieves a user's subscription.
	GetSubscription(userID string) string

	// SetSubscription sets a user's subscription.
	SetSubscription(userID string, subscription string) error
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

// GetSubscription retrieves a user's subscription.
func (s *userService) GetSubscription(userID string) string {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	sub, err := s.storage.GetSubscription(userID)
	if sub == "" || err != nil {
		return constants.DefaultSubscription
	}
	return sub
}

// SetSubscription sets a user's subscription.
func (s *userService) SetSubscription(userID string, subscription string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if subscription != constants.FreeSubscription && subscription != constants.PremiumSubscription {
		return &InvalidSubscriptionValueError{}
	}

	return s.storage.SetSubscription(userID, subscription)
}
