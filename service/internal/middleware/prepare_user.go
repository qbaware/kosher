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
		userID := r.Context().Value(UserIDKey{}).(string)
		userEmail := r.Context().Value(UserEmailKey{}).(string)
		userIsPremium := r.Context().Value(UserIsPremiumKey{}).(bool)

		user := models.User{
			ID:        userID,
			Email:     userEmail,
			IsPremium: userIsPremium,
		}

		ctx := context.WithValue(r.Context(), UserKey{}, user)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
