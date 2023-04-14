package storage

import "github.com/qbaware/kosher/internal/models"

// Storage describes a tab storage.
type Storage interface {

	// AddTab adds a tab to storage.
	AddTab(userID string, t models.Tab) error

	// UpsertTab adds or updates a tab in storage.
	UpsertTab(userID string, t models.Tab) error

	// ContainsTab checks if a tab is in storage.
	ContainsTab(userID string, id string) bool

	// ListTabs retrieves all tabs from storage.
	ListTabs(userID string) []models.Tab

	// RemoveTab removes a tab from storage.
	RemoveTab(userID string, id string) error
}
