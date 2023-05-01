package middleware

import (
	"context"
	"net/http"

	"github.com/qbaware/kosher/internal/models"
)

// UserKey is the key for the user in the request context.
type UserKey struct{}

// PrepareUser adds the user to the request context.
func PrepareUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(userIDKey{}).(string)
		userName := r.Context().Value(userNameKey{}).(string)
		userEmail := r.Context().Value(userEmailKey{}).(string)
		userProfilePicURL := r.Context().Value(userProfilePicURLKey{}).(string)
		userIsPremium := r.Context().Value(userIsPremiumKey{}).(bool)

		user := models.User{
			ID:            userID,
			Name:          userName,
			Email:         userEmail,
			ProfilePicURL: userProfilePicURL,
			IsPremium:     userIsPremium,
		}

		ctx := context.WithValue(r.Context(), UserKey{}, user)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
