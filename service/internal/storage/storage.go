package storage

import "github.com/qbaware/kosher/internal/models"

// Storage describes a tab storage.
type Storage interface {

	// AddTab adds a tab to storage.
	AddTab(t models.Tab) error

	// GetTab retrieves a tab from storage.
	GetTab(id string) models.Tab

	// ListTabs retrieves all tabs from storage.
	ListTabs() []models.Tab

	// RemoveTab removes a tab from storage.
	RemoveTab(id string) models.Tab
}
