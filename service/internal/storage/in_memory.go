package storage

import (
	"errors"

	"github.com/qbaware/kosher/internal/models"
)

// InMemoryStorage represents an in-memory storage for tabs.
type InMemoryStorage struct {
	storage  []models.Tab
	capacity int
}

var _ Storage = &InMemoryStorage{}

// NewInMemoryStorage creates an in-memory tabs storage.
func NewInMemoryStorage(capacity int) *InMemoryStorage {
	return &InMemoryStorage{
		storage:  make([]models.Tab, 0),
		capacity: capacity,
	}
}

// AddTab adds a tab to the storage.
func (ims *InMemoryStorage) AddTab(tab models.Tab) error {
	if len(ims.storage) >= ims.capacity {
		ims.storage = ims.storage[:len(ims.storage)-1]
	}

	if !tab.IsValid() {
		return errors.New("tab is invalid")
	}

	ims.storage = append(ims.storage, tab)
	return nil
}

// GetTab retrieves a tab from storage.
func (ims *InMemoryStorage) GetTab(id string) models.Tab {
	for _, t := range ims.storage {
		if t.ID == id {
			return t
		}
	}

	return models.Tab{}
}

// ListTabs retrieves all tabs.
func (ims *InMemoryStorage) ListTabs() []models.Tab {
	return ims.storage
}

// RemoveTab removes a tab from the storage.
func (ims *InMemoryStorage) RemoveTab(id string) models.Tab {
	for i, t := range ims.storage {
		if t.ID == id {
			ims.storage = append(ims.storage[:i], ims.storage[i+1:]...)
			return t
		}
	}

	return models.Tab{}
}
