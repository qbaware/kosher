package middleware

import (
	"context"
	"net/http"

	"github.com/qbaware/kosher/internal/models"
)

// UserKey is the key for the user in the request context.
type UserKey struct{}

// NewPrepareUser creates a middleware that adds the user to the request context.
func NewPrepareUser() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := r.Context().Value(userIDKey{}).(string)
			userName := r.Context().Value(userNameKey{}).(string)
			userEmail := r.Context().Value(userEmailKey{}).(string)
			userProfilePicURL := r.Context().Value(userProfilePicURLKey{}).(string)
			userSubscription := r.Context().Value(userSubscriptionKey{}).(string)

			user := models.User{
				ID:            userID,
				Name:          userName,
				Email:         userEmail,
				ProfilePicURL: userProfilePicURL,
				Subscription:  userSubscription,
			}

			ctx := context.WithValue(r.Context(), UserKey{}, user)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
