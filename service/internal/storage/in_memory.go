package storage

import (
	"errors"
	"sync"

	"github.com/qbaware/kosher/internal/models"
)

// InMemoryStorage represents an in-memory storage for tabs.
type InMemoryStorage struct {
	browsersStorage map[string][]models.Browser

	lock sync.Mutex
}

var _ Storage = &InMemoryStorage{}

// NewInMemoryStorage creates an in-memory tabs storage with default capacity of 1000 tabs.
func NewInMemoryStorageWithDefaultCapacity() *InMemoryStorage {
	return &InMemoryStorage{
		browsersStorage: make(map[string][]models.Browser, 0),
	}
}

// NewInMemoryStorage creates an in-memory tabs storage.
func NewInMemoryStorage(capacity int) *InMemoryStorage {
	return &InMemoryStorage{
		browsersStorage: make(map[string][]models.Browser, 0),
	}
}

// UpsertTab adds or updates a browser in storage.
func (ims *InMemoryStorage) UpsertBrowser(userID string, browser models.Browser) error {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	if ims.containsBrowser(userID, browser.ID) {
		ims.removeBrowser(userID, browser.ID)
	}
	ims.addBrowser(userID, browser)

	return nil
}

// ListTabs retrieves all browsers.
func (ims *InMemoryStorage) ListBrowsers(userID string) []models.Browser {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	if browsers, ok := ims.browsersStorage[userID]; ok {
		return browsers
	}
	return []models.Browser{}
}

// RemoveTab removes a browser from the storage.
func (ims *InMemoryStorage) RemoveBrowsers(userID string, ids []string) error {
	ims.lock.Lock()
	defer ims.lock.Unlock()

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
