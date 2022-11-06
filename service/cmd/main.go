package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/qbaware/kosher/internal/api"
	"github.com/qbaware/kosher/internal/storage"
)

const (
	maxTabs = 1000
)

func main() {
	log.Println("Server starting ...")

	router := mux.NewRouter()

	storage := storage.NewInMemoryStorage(maxTabs)

	router.HandleFunc("/tabs", api.GetTabsHandler(storage)).Methods(http.MethodGet)
	router.HandleFunc("/tabs", api.AddTabHandler(storage)).Methods(http.MethodPost)
	router.HandleFunc("/tabs/{id}", api.GetTabHandler(storage)).Methods(http.MethodGet)
	router.HandleFunc("/tabs/{id}", api.RemoveTabHandler(storage)).Methods(http.MethodDelete)

	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":8080", router))
}
