package storage

import "github.com/qbaware/kosher/internal/models"

// Storage describes a tab storage.
type Storage interface {

	// AddTab adds a tab to storage.
	AddTab(t models.Tab) error

	// UpsertTab adds or updates a tab in storage.
	UpsertTab(t models.Tab) error

	// ContainsTab checks if a tab is in storage.
	ContainsTab(id string) bool

	// ListTabs retrieves all tabs from storage.
	ListTabs() []models.Tab

	// RemoveTab removes a tab from storage.
	RemoveTab(id string) error
}
