package storage

import "github.com/qbaware/kosher/internal/models"

const (
	// MaxBrowsersLimitPerUser is a maximum number of browsers per user.
	MaxBrowsersLimitPerUser = 2
)

// Storage describes a browser storage.
type Storage interface {

	// UpsertBrowser adds or updates a browser with all its tabs to storage.
	UpsertBrowser(userID string, browser models.Browser) error

	// ListBrowsers retrieves all browsers with their corresponding tabs from storage.
	ListBrowsers(userID string) []models.Browser

	// RemoveTab removes browsers from storage.
	RemoveBrowsers(userID string, ids []string) error
}
