package middleware

import (
	"context"
	"net/http"
)

// UserIsPremiumKey is the key for the user premium status in the request context.
type UserIsPremiumKey struct{}

// UserPremiumCheck checks if the user is premium and adds the result to the request context.
func UserPremiumCheck(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		isUserPremium := false
		// TODO: Call Stripe backend to check if user is premium or check storage

		ctx := context.WithValue(r.Context(), UserIsPremiumKey{}, isUserPremium)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
