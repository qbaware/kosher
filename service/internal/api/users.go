package api

import (
	"encoding/json"
	"net/http"

	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/models"
)

// NewGetBrowsersHandler retrieves all stored browsers.
func NewGetUserInfoHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		user := r.Context().Value(middleware.UserKey{}).(models.User)

		userJSON, _ := json.Marshal(user)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(userJSON)
	}
}
