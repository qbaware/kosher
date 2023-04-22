package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// UserIDKey is the key for the user ID in the request context.
type UserIDKey struct{}

// UserEmailKey is the key for the user email in the request context.
type UserEmailKey struct{}

type user struct {
	ID    string `json:"user_id"`
	Email string `json:"email"`
}

// GoogleOAuth2 validates the access token in the Authorization header. If the token is valid, the user ID and email are added to the request context.
func GoogleOAuth2(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessToken := r.Header.Get("Authorization")
		if accessToken == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenValidateEndpoint := fmt.Sprintf("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s", accessToken)
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

		bodyBytes, err := ioutil.ReadAll(resp.Body)
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

		ctx := context.WithValue(r.Context(), UserIDKey{}, user.ID)
		ctx = context.WithValue(ctx, UserEmailKey{}, user.Email)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
