package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/tabs/backup", TabsBackupHandler).Methods(http.MethodPost)
	router.HandleFunc("/tabs/retrieve", TabsRetrieveHandler).Methods(http.MethodGet)

	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":8080", router))
}
