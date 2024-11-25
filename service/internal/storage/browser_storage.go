package storage

import "github.com/qbaware/kosher/internal/models"

// BrowserStorage describes a browser storage.
type BrowserStorage interface {

	// UpsertBrowser adds or updates a browser with all its tabs to storage.
	UpsertBrowser(userID string, browser models.Browser) error

	// ListBrowsers retrieves all browsers with their corresponding tabs from storage.
	ListBrowsers(userID string) ([]models.Browser, error)

	// ExistsBrowser checks if a browser exists in storage.
	ExistsBrowser(userID string, browserID string) (bool, error)

	// CountBrowsers counts all browsers from storage.
	CountBrowsers(userID string) (int, error)

	// RemoveBrowsers removes browsers from storage.
	RemoveBrowsers(userID string, ids []string) error
}
