package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/qbaware/kosher/internal/api"
	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/service"
	"github.com/qbaware/kosher/internal/storage"
	"github.com/qbaware/kosher/internal/stripe"
	"github.com/rs/cors"
)

const (
	defaultPort = "5656"
)

var (
	port             = os.Getenv("PORT")
	isLocal          = os.Getenv("IS_LOCAL") != "false"
	dbConnStr        = os.Getenv("DB_CONN_STR")
	stripeKey        = os.Getenv("STRIPE_KEY")
	stripeSignSecret = os.Getenv("STRIPE_SIGN_SECRET")
)

func init() {
	if port == "" {
		port = defaultPort
	}

	if !isLocal && (dbConnStr == "" || stripeKey == "" || stripeSignSecret == "") {
		log.Fatalf("Missing connection string in non-local mode")
	}
}

func main() {
	log.Printf("Server starting on port %s ...\n", port)

	var browserStorage storage.BrowserStorage
	var userStorage storage.UserStorage
	if isLocal {
		inMemStorage := storage.NewInMemoryStorage()
		inMemStorage.PopulateMockData()

		browserStorage = inMemStorage
		userStorage = inMemStorage
	} else {
		dbStorage := storage.NewSQLStorage()
		dbStorage.Connect(dbConnStr)

		browserStorage = dbStorage
		userStorage = dbStorage
	}

	browserService := service.NewBrowserService(browserStorage)
	userService := service.NewUserService(userStorage)

	router := mux.NewRouter()

	// Protected routes that generate a user in the request context.
	protected := router.PathPrefix("/").Subrouter()
	if isLocal {
		protected.Use(middleware.NewGoogleOAuth2Mock())
	} else {
		protected.Use(middleware.NewGoogleOAuth2())
	}
	protected.Use(middleware.NewPrepareUser(userService))

	// Browser routes.
	browserRouter := protected.PathPrefix("/browsers").Subrouter()
	browserRouter.HandleFunc("", api.NewGetBrowsersHandler(browserService)).Methods(http.MethodGet)
	browserRouter.HandleFunc("", api.NewPutBrowserHandler(browserService)).Methods(http.MethodPut)
	browserRouter.HandleFunc("", api.NewRemoveBrowsersHandler(browserService)).Methods(http.MethodDelete)

	// User routes.
	userRouter := protected.PathPrefix("/user").Subrouter()
	userRouter.HandleFunc("", api.NewGetUserInfoHandler()).Methods(http.MethodGet)

	// Unprotected routes.
	if !isLocal {
		stripeConfig := stripe.Config{
			StripeKey:         stripeKey,
			WebhookSignSecret: stripeSignSecret,
		}

		router.HandleFunc("/subscription_webhooks", api.NewPostSubscriptionWebhookHandler(userService, stripeConfig)).Methods(http.MethodPost)
	}

	cors := cors.New(cors.Options{
		AllowedMethods: []string{http.MethodOptions, http.MethodHead, http.MethodGet, http.MethodPut, http.MethodDelete},
		AllowedHeaders: []string{"*"},
	})

	log.Fatal(http.ListenAndServe(":"+port, cors.Handler(router)))
}
