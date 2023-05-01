package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

// userIDKey is the key for the user ID in the request context.
type userIDKey struct{}

// userNameKey is the key for the user name in the request context.
type userNameKey struct{}

// userEmailKey is the key for the user email in the request context.
type userEmailKey struct{}

// userProfilePicURLKey is the key for the user profile picture URL in the request context.
type userProfilePicURLKey struct{}

type user struct {
	ID            string `json:"id"`
	Name          string `json:"given_name"`
	Email         string `json:"email"`
	ProfilePicURL string `json:"picture"`
}

// NewGoogleOAuth2 creates a middleware that validates the access token in the Authorization header. If the token is valid, the user ID and email are added to the request context.
func NewGoogleOAuth2() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			accessToken := r.Header.Get("Authorization")
			if accessToken == "" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			tokenValidateEndpoint := fmt.Sprintf("https://www.googleapis.com/oauth2/v1/userinfo?access_token=%s", accessToken)
			resp, err := http.Get(tokenValidateEndpoint)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			bodyBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			var user user
			err = json.Unmarshal(bodyBytes, &user)
			if err != nil {
				log.Fatal(err)
			}

			log.Printf("User with email '%s' authenticated successfully", user.Email)

			ctx := context.WithValue(r.Context(), userIDKey{}, user.ID)
			ctx = context.WithValue(ctx, userNameKey{}, user.Name)
			ctx = context.WithValue(ctx, userEmailKey{}, user.Email)
			ctx = context.WithValue(ctx, userProfilePicURLKey{}, user.ProfilePicURL)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
