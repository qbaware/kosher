package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/storage"
)

// GetTabsHandler retrieves all stored tabs.
func GetTabsHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		tabs := storage.ListTabs()

		tabsJSON, _ := json.Marshal(tabs)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(tabsJSON)
	}
}

// AddTabHandler stores a tab.
func AddTabHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var tab models.Tab
		if err := json.NewDecoder(r.Body).Decode(&tab); err != nil {
			log.Printf("error: failed to decode json %s\n", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if tab.ID == "" {
			tab = models.NewTab(tab.Name, tab.URL)
		}

		err := storage.AddTab(tab)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		tabJSON, _ := json.Marshal(tab)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(tabJSON)
	}
}

// GetTabHandler retrieves a tab from storage.
func GetTabHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		tab := storage.GetTab(id)

		tabJSON, _ := json.Marshal(tab)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(tabJSON)
	}
}

// RemoveTabHandler removes a tab from storage.
func RemoveTabHandler(storage storage.Storage) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		tab := storage.RemoveTab(id)

		tabJSON, _ := json.Marshal(tab)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(tabJSON)
	}
}
