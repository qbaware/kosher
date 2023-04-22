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
		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		browsers := s.ListBrowsers(userID)

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

		userID := r.Context().Value(middleware.UserIDKey{}).(string)
		userEmail := r.Context().Value(middleware.UserEmailKey{}).(string)

		log.Printf("User %s is putting his %s browser with ID '%s' and name '%s'\n", userEmail, browser.BrowserType, browser.ID, browser.DeviceName)
		err := s.UpsertBrowser(userID, browser)
		if err != nil {
			switch err.(type) {
			case *storage.MaxBrowsersLimitPerUserError:
				w.WriteHeader(http.StatusTooManyRequests)
			default:
				w.WriteHeader(http.StatusInternalServerError)
			}

			w.Write([]byte(err.Error()))
			return
		}

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

		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		s.RemoveBrowsers(userID, browserIDs)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
