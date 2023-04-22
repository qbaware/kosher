package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// GetBrowsersHandler retrieves all stored browsers.
func GetBrowsersHandler(s storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		user := r.Context().Value(middleware.UserKey{}).(models.User)

		browsers := s.ListBrowsers(user.ID)

		browsersJSON, _ := json.Marshal(browsers)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(browsersJSON)
	}
}

// PutBrowserHandler stores a browser with all its tabs.
func PutBrowserHandler(s storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var browser models.Browser
		if err := json.NewDecoder(r.Body).Decode(&browser); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		browser.LastUpdateTime = fmt.Sprintf("%d", time.Now().UnixNano())

		if !browser.IsValid() {
			log.Printf("error: invalid browser %v\n", browser)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		user := r.Context().Value(middleware.UserKey{}).(models.User)

		log.Printf("User %s is trying to put his %s browser with ID '%s' and name '%s'\n", user.Email, browser.BrowserType, browser.ID, browser.DeviceName)

		// NOTE: Note that this API is susceptible to race conditions.

		browsers := s.ListBrowsers(user.ID)
		if len(browsers) >= MaxBrowsersLimitPerUser {
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte((&MaxBrowsersLimitPerUserError{}).Error()))
			return
		}

		err := s.UpsertBrowser(user.ID, browser)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		log.Printf("User %s successfully put his %s browser with ID '%s' and name '%s'\n", user.Email, browser.BrowserType, browser.ID, browser.DeviceName)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}

// RemoveBrowsersHandler removes a browser from storage.
func RemoveBrowsersHandler(s storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var browserIDs []string
		if err := json.NewDecoder(r.Body).Decode(&browserIDs); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		user := r.Context().Value(middleware.UserKey{}).(models.User)

		s.RemoveBrowsers(user.ID, browserIDs)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
