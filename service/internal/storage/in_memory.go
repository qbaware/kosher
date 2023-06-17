package storage

import (
	"errors"

	"github.com/qbaware/kosher/internal/models"
)

// InMemoryStorage represents an in-memory storage for browsers and users.
type InMemoryStorage struct {
	browsersStorage          map[string][]models.Browser
	userSubscriptionsStorage map[string]string
}

var _ BrowserStorage = &InMemoryStorage{}
var _ UserStorage = &InMemoryStorage{}

// NewInMemoryStorage creates an in-memory browsers and users storage.
func NewInMemoryStorage() *InMemoryStorage {
	return &InMemoryStorage{
		browsersStorage: make(map[string][]models.Browser, 0),
	}
}

// UpsertTab adds or updates a browser in storage.
func (ims *InMemoryStorage) UpsertBrowser(userID string, browser models.Browser) error {
	if ims.containsBrowser(userID, browser.ID) {
		ims.removeBrowser(userID, browser.ID)
	}
	ims.addBrowser(userID, browser)

	return nil
}

// ListTabs retrieves all browsers.
func (ims *InMemoryStorage) ListBrowsers(userID string) ([]models.Browser, error) {
	return ims.listBrowsers(userID), nil
}

func (ims *InMemoryStorage) listBrowsers(userID string) []models.Browser {
	if browsers, ok := ims.browsersStorage[userID]; ok {
		return browsers
	}
	return []models.Browser{}
}

// ExistsBrowser checks if a browser exists in storage.
func (ims *InMemoryStorage) ExistsBrowser(userID string, browserID string) (bool, error) {
	// TODO: implement
	panic("not implemented")
}

// CountBrowsers counts all browsers from storage.
func (ims *InMemoryStorage) CountBrowsers(userID string) (int, error) {
	// TODO: implement
	panic("not implemented")
}

// RemoveTab removes a browser from the storage.
func (ims *InMemoryStorage) RemoveBrowsers(userID string, ids []string) error {
	for _, id := range ids {
		ims.removeBrowser(userID, id)
	}

	return nil
}

func (ims *InMemoryStorage) addBrowser(userID string, browser models.Browser) error {
	if ims.containsBrowser(userID, browser.ID) {
		return errors.New("browser already exists")
	}

	ims.browsersStorage[userID] = append(ims.browsersStorage[userID], browser)
	return nil
}

func (ims *InMemoryStorage) containsBrowser(userID string, id string) bool {
	for _, b := range ims.browsersStorage[userID] {
		if b.ID == id {
			return true
		}
	}
	return false
}

func (ims *InMemoryStorage) removeBrowser(userID string, id string) error {
	for i, b := range ims.browsersStorage[userID] {
		if b.ID == id {
			ims.browsersStorage[userID] = append(ims.browsersStorage[userID][:i], ims.browsersStorage[userID][i+1:]...)
			break
		}
	}

	return nil
}

// GetUser retrieves a user.
func (ims *InMemoryStorage) GetUser(userID string) (models.User, error) {
	// TODO: Implement.
	panic("not implemented")
}

// UpsertUser adds or updates a user.
func (ims *InMemoryStorage) UpsertUser(user models.User) error {
	// TODO: Implement.
	panic("not implemented")
}

// UpsertSubscription updates a user's subscription.
func (ims *InMemoryStorage) UpsertSubscription(userID string, subscription string) error {
	ims.userSubscriptionsStorage[userID] = subscription
	return nil
}
