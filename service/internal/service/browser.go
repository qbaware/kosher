package service

import (
	"sync"

	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// BrowserService is a service that takes care of browser management - retrieval, addition, and removal.
type BrowserService interface {
	ListBrowsers(userID string) []models.Browser
	UpsertBrowser(userID string, browser models.Browser) error
	RemoveBrowsers(userID string, browserIDs []string) error
}

type browserService struct {
	storage storage.Storage

	mutex sync.Mutex
}

var _ BrowserService = &browserService{}

// NewBrowserService creates a new BrowserService.
func NewBrowserService(storage storage.Storage) BrowserService {
	return &browserService{storage: storage}
}

// ListBrowsers lists all browsers.
func (s *browserService) ListBrowsers(userID string) []models.Browser {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.storage.ListBrowsers(userID)
}

// UpsertBrowser adds or updates a browser.
func (s *browserService) UpsertBrowser(userID string, browser models.Browser) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	browsers := s.storage.ListBrowsers(userID)
	if len(browsers) >= MaxBrowsersLimitPerUser {
		return &MaxBrowsersLimitPerUserError{}
	}

	return s.storage.UpsertBrowser(userID, browser)
}

// RemoveBrowsers removes browsers.
func (s *browserService) RemoveBrowsers(userID string, browserIDs []string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.storage.RemoveBrowsers(userID, browserIDs)
}
