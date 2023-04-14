package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// GetTabsHandler retrieves all stored tabs.
func GetTabsHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		tabs := storage.ListTabs(userID)

		tabsJSON, _ := json.Marshal(tabs)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(tabsJSON)
	}
}

// AddTabHandler stores a tab.
func AddTabHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		var tabs []models.Tab
		if err := json.NewDecoder(r.Body).Decode(&tabs); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		for _, tab := range tabs {
			if !tab.IsValid() {
				log.Printf("error: invalid tab %v\n", tab)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
		}

		for _, tab := range tabs {
			err := storage.UpsertTab(userID, tab)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte(err.Error()))
				return
			}
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}

// RemoveTabsHandler removes a tab from storage.
func RemoveTabsHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(middleware.UserIDKey{}).(string)

		var tabIDs []string
		if err := json.NewDecoder(r.Body).Decode(&tabIDs); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		for _, id := range tabIDs {
			if !storage.ContainsTab(userID, id) {
				continue
			}

			storage.RemoveTab(userID, id)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}
