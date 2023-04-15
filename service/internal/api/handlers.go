package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// GetBrowsersHandler retrieves all stored browsers.
func GetBrowsersHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		browsers := storage.ListBrowsers(userID)

		browsersJSON, _ := json.Marshal(browsers)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(browsersJSON)
	}
}

// PutBrowserHandler stores a browser with all its tabs.
func PutBrowserHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var browser models.Browser
		if err := json.NewDecoder(r.Body).Decode(&browser); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		if !browser.IsValid() {
			log.Printf("error: invalid browser %v\n", browser)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		err := storage.UpsertBrowser(userID, browser)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}

// RemoveBrowsersHandler removes a browser from storage.
func RemoveBrowsersHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var browserIDs []string
		if err := json.NewDecoder(r.Body).Decode(&browserIDs); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		storage.RemoveBrowsers(userID, browserIDs)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
