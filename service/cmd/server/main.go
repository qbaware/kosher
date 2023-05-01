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

	router := chi.NewRouter()

	storage := storage.NewInMemoryStorage()
	browserService := service.NewBrowserService(storage)

	router.Use(middleware.GoogleOAuth2)
	router.Use(middleware.UserPremiumCheck)
	router.Use(middleware.PrepareUser)

	router.Get("/browsers", api.NewGetBrowsersHandler(browserService))
	router.Put("/browsers", api.NewPutBrowserHandler(browserService))
	router.Delete("/browsers", api.NewRemoveBrowsersHandler(browserService))

	router.Get("/user", api.NewGetUserInfoHandler())

	cors := cors.New(cors.Options{
		AllowedMethods: []string{http.MethodOptions, http.MethodHead, http.MethodGet, http.MethodPut, http.MethodDelete},
		AllowedHeaders: []string{"*"},
	})

	log.Fatal(http.ListenAndServe(":"+port, cors.Handler(router)))
}
