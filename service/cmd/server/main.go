package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/qbaware/kosher/internal/api"
	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/service"
	"github.com/qbaware/kosher/internal/storage"
	"github.com/rs/cors"
)

const (
	defaultPort = "5656"
)

var (
	port = os.Getenv("PORT")
)

func init() {
	if port == "" {
		port = defaultPort
	}
}

func main() {
	log.Printf("Server starting on port %s ...\n", port)

	storage := storage.NewSQLStorage()
	browserService := service.NewBrowserService(storage)
	userService := service.NewUserService(storage)

	router := chi.NewRouter()

	// Protected routes that generate a user in the request context.
	router.Group(func(r chi.Router) {
		router.Use(middleware.NewGoogleOAuth2())
		router.Use(middleware.NewPrepareUser(userService))

		r.Route("/browsers", func(r chi.Router) {
			router.Get("/", api.NewGetBrowsersHandler(browserService))
			router.Put("/", api.NewPutBrowserHandler(browserService))
			router.Delete("/", api.NewRemoveBrowsersHandler(browserService))
		})

		r.Route("/user", func(r chi.Router) {
			router.Get("/", api.NewGetUserInfoHandler())
		})
	})

	// Unprotected routes.
	router.Group(func(r chi.Router) {
		r.Post("/subscription_webhooks", api.NewPostSubscriptionWebhooksHandler(userService))
	})

	cors := cors.New(cors.Options{
		AllowedMethods: []string{http.MethodOptions, http.MethodHead, http.MethodGet, http.MethodPut, http.MethodDelete},
		AllowedHeaders: []string{"*"},
	})

	log.Fatal(http.ListenAndServe(":"+port, cors.Handler(router)))
}
