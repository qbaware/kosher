package middleware

import (
	"context"
	"net/http"

	"github.com/qbaware/kosher/internal/constants"
	"github.com/qbaware/kosher/internal/models"
	"github.com/qbaware/kosher/internal/service"
)

// UserKey is the key for the user in the request context.
type UserKey struct{}

// NewPrepareUser creates a middleware that adds the user to the request context.
func NewPrepareUser(userService service.UserService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := r.Context().Value(userIDKey{}).(string)
			userName := r.Context().Value(userNameKey{}).(string)
			userEmail := r.Context().Value(userEmailKey{}).(string)
			userProfilePicURL := r.Context().Value(userProfilePicURLKey{}).(string)

			var user models.User

			dbUser, err := userService.GetUser(userID)
			switch err {
			case nil:
				// Double check that there's no funny business going on.
				if dbUser.Email != userEmail {
					http.Error(w, "Invalid user", http.StatusBadRequest)
					return
				}

				user = dbUser
			case service.RecordNotFoundError:
				user = models.User{
					ID:            userID,
					Name:          userName,
					Email:         userEmail,
					ProfilePicURL: userProfilePicURL,
					Subscription:  constants.DefaultSubscription,
				}

				userService.UpsertUser(user)
			default:
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			ctx := context.WithValue(r.Context(), UserKey{}, user)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}

// NewPrepareUser creates a mock middleware that adds the user to the request context.
func NewPrepareUserMock() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := models.User{
				ID:            "00000000-0000-0000-0000-000000000000",
				Name:          "Daniel Gospodinow",
				Email:         "hi@danielgospodinow.com",
				ProfilePicURL: "https://gravatar.com/avatar/85c84e08dcb9a38af28c20e93f82b721547ff53e4702df4d5df62de340181e7b?s=256",
				Subscription:  constants.DefaultSubscription,
			}

			ctx := context.WithValue(r.Context(), UserKey{}, user)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}
