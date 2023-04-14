package storage

import (
	"errors"
	"sync"

	"github.com/qbaware/kosher/internal/models"
)

// InMemoryStorage represents an in-memory storage for tabs.
type InMemoryStorage struct {
	storage  map[string][]models.Tab
	capacity int

	lock sync.Mutex
}

var _ Storage = &InMemoryStorage{}

// NewInMemoryStorage creates an in-memory tabs storage with default capacity of 1000 tabs.
func NewInMemoryStorageWithDefaultCapacity() *InMemoryStorage {
	return &InMemoryStorage{
		storage:  make(map[string][]models.Tab, 0),
		capacity: 1000,
	}
}

// NewInMemoryStorage creates an in-memory tabs storage.
func NewInMemoryStorage(capacity int) *InMemoryStorage {
	return &InMemoryStorage{
		storage:  make(map[string][]models.Tab, 0),
		capacity: capacity,
	}
}

// AddTab adds a tab to the storage.
func (ims *InMemoryStorage) AddTab(userID string, tab models.Tab) error {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.addTab(userID, tab)
}

func (ims *InMemoryStorage) addTab(userID string, tab models.Tab) error {
	if len(ims.storage[userID]) >= ims.capacity {
		ims.storage[userID] = ims.storage[userID][:len(ims.storage[userID])-1]
	}

	if !tab.IsValid() {
		return errors.New("tab is invalid")
	}

	if ims.containsTab(userID, tab.ID) {
		return errors.New("tab already exists")
	}

	ims.storage[userID] = append(ims.storage[userID], tab)
	return nil
}

// UpsertTab adds or updates a tab in storage.
func (ims *InMemoryStorage) UpsertTab(userID string, tab models.Tab) error {
	if !tab.IsValid() {
		return errors.New("tab is invalid")
	}

	ims.lock.Lock()
	defer ims.lock.Unlock()

	if ims.containsTab(userID, tab.ID) {
		ims.removeTab(userID, tab.ID)
	}

	return ims.addTab(userID, tab)
}

// ContainsTab checks if a tab is in storage.
func (ims *InMemoryStorage) ContainsTab(userID string, id string) bool {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.containsTab(userID, id)
}

func (ims *InMemoryStorage) containsTab(userID string, id string) bool {
	for _, t := range ims.storage[userID] {
		if t.ID == id {
			return true
		}
	}
	return false
}

// ListTabs retrieves all tabs.
func (ims *InMemoryStorage) ListTabs(userID string) []models.Tab {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	if tabs := ims.storage[userID]; tabs != nil {
		return tabs
	}
	return []models.Tab{}
}

// RemoveTab removes a tab from the storage.
func (ims *InMemoryStorage) RemoveTab(userID string, id string) error {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.removeTab(userID, id)
}

func (ims *InMemoryStorage) removeTab(userID string, id string) error {
	for i, t := range ims.storage[userID] {
		if t.ID == id {
			ims.storage[userID] = append(ims.storage[userID][:i], ims.storage[userID][i+1:]...)
			return nil
		}
	}

	return errors.New("tab not found")
}
