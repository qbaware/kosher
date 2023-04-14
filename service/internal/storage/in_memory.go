package storage

import (
	"errors"
	"sync"

	"github.com/qbaware/kosher/internal/models"
)

// InMemoryStorage represents an in-memory storage for tabs.
type InMemoryStorage struct {
	storage  []models.Tab
	capacity int

	lock sync.Mutex
}

var _ Storage = &InMemoryStorage{}

// NewInMemoryStorage creates an in-memory tabs storage with default capacity of 1000 tabs.
func NewInMemoryStorageWithDefaultCapacity() *InMemoryStorage {
	return &InMemoryStorage{
		storage:  make([]models.Tab, 0),
		capacity: 1000,
	}
}

// NewInMemoryStorage creates an in-memory tabs storage.
func NewInMemoryStorage(capacity int) *InMemoryStorage {
	return &InMemoryStorage{
		storage:  make([]models.Tab, 0),
		capacity: capacity,
	}
}

// AddTab adds a tab to the storage.
func (ims *InMemoryStorage) AddTab(tab models.Tab) error {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.addTab(tab)
}

func (ims *InMemoryStorage) addTab(tab models.Tab) error {
	if len(ims.storage) >= ims.capacity {
		ims.storage = ims.storage[:len(ims.storage)-1]
	}

	if !tab.IsValid() {
		return errors.New("tab is invalid")
	}

	if ims.containsTab(tab.ID) {
		return errors.New("tab already exists")
	}

	ims.storage = append(ims.storage, tab)
	return nil
}

// UpsertTab adds or updates a tab in storage.
func (ims *InMemoryStorage) UpsertTab(tab models.Tab) error {
	if !tab.IsValid() {
		return errors.New("tab is invalid")
	}

	ims.lock.Lock()
	defer ims.lock.Unlock()

	if ims.containsTab(tab.ID) {
		ims.removeTab(tab.ID)
	}

	return ims.addTab(tab)
}

// ContainsTab checks if a tab is in storage.
func (ims *InMemoryStorage) ContainsTab(id string) bool {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.containsTab(id)
}

func (ims *InMemoryStorage) containsTab(id string) bool {
	for _, t := range ims.storage {
		if t.ID == id {
			return true
		}
	}
	return false
}

// ListTabs retrieves all tabs.
func (ims *InMemoryStorage) ListTabs() []models.Tab {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.storage
}

// RemoveTab removes a tab from the storage.
func (ims *InMemoryStorage) RemoveTab(id string) error {
	ims.lock.Lock()
	defer ims.lock.Unlock()

	return ims.removeTab(id)
}

func (ims *InMemoryStorage) removeTab(id string) error {
	for i, t := range ims.storage {
		if t.ID == id {
			ims.storage = append(ims.storage[:i], ims.storage[i+1:]...)
			return nil
		}
	}

	return errors.New("tab not found")
}
