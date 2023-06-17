package service

import (
	"sync"

	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// BrowserService is a service that takes care of browser management - retrieval, addition, and removal.
type BrowserService interface {
	ListBrowsers(userID string) []models.Browser
	UpsertBrowser(user models.User, browser models.Browser) error
	RemoveBrowsers(userID string, browserIDs []string) error
}

type browserService struct {
	storage storage.BrowserStorage

	mutex sync.Mutex
}

var _ BrowserService = &browserService{}

// NewBrowserService creates a new BrowserService.
func NewBrowserService(storage storage.BrowserStorage) BrowserService {
	return &browserService{storage: storage}
}

// ListBrowsers lists all browsers.
func (s *browserService) ListBrowsers(userID string) []models.Browser {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	browsers, err := s.storage.ListBrowsers(userID)
	if err != nil {
		return []models.Browser{}
	}
	return browsers
}

// UpsertBrowser adds or updates a browser.
func (s *browserService) UpsertBrowser(user models.User, browser models.Browser) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	browserExists, err := s.storage.ExistsBrowser(user.ID, browser.ID)
	if err != nil {
		return err
	}

	if browserExists {
		return s.storage.UpsertBrowser(user.ID, browser)
	}

	browsersCount, err := s.storage.CountBrowsers(user.ID)
	if err != nil {
		return err
	}

	if browsersCount >= MaxBrowsersLimitPerUser {
		return &MaxBrowsersLimitPerUserError{}
	}

	return s.storage.UpsertBrowser(user.ID, browser)
}

// RemoveBrowsers removes browsers.
func (s *browserService) RemoveBrowsers(userID string, browserIDs []string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.storage.RemoveBrowsers(userID, browserIDs)
}
