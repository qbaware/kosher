package middleware

import (
	"context"
	"net/http"

	"github.com/qbaware/kosher/internal/service"
)

// userSubscriptionKey is the key for the user subscription in the request context.
type userSubscriptionKey struct{}

// NewUserSubscription creates a middleware that adds the user's subscription to the request context.
func NewUserSubscription(userService service.UserService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := r.Context().Value(userIDKey{}).(string)
			sub := userService.GetSubscription(userID)

			ctx := context.WithValue(r.Context(), userSubscriptionKey{}, sub)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
