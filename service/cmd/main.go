package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/qbaware/kosher/internal/api"
	"github.com/qbaware/kosher/internal/middleware"
	"github.com/qbaware/kosher/internal/storage"
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
	log.Printf("Server starting on port %s ...", port)

	router := mux.NewRouter()

	storage := storage.NewInMemoryStorageWithDefaultCapacity()

	router.Use(middleware.GoogleOAuth2Middleware)

	router.HandleFunc("/tabs", api.GetTabsHandler(storage)).Methods(http.MethodGet)
	router.HandleFunc("/tabs", api.AddTabHandler(storage)).Methods(http.MethodPut)
	router.HandleFunc("/tabs", api.RemoveTabsHandler(storage)).Methods(http.MethodDelete)

	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
