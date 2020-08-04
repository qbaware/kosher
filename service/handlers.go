package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

// TabsBackupHandler backups provided array of tabs.
func TabsBackupHandler(w http.ResponseWriter, r *http.Request) {
	var tabsArray []Tab
	if err := json.NewDecoder(r.Body).Decode(&tabsArray); err != nil {
		fmt.Printf("error: failed to decode json %s\n", err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if len(tabsArray) == 0 {
		fmt.Printf("error: empty array\n")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	for _, tab := range tabsArray {
		if !tab.HasRequiredFields() {
			fmt.Printf("error: missing fields from tab object\n")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	BackupTabs(tabsArray)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}

// TabsRetrieveHandler retrieves all tabs from the backup.
func TabsRetrieveHandler(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()

	tabsBackupIndex, perr := strconv.ParseInt(queryParams.Get("index"), 10, 32)
	if perr != nil {
		tabsBackupIndex = 0
	}

	tabsBackup, rerr := RetrieveTabsBackup(int(tabsBackupIndex))
	if rerr != nil {
		fmt.Printf("error: no such backup available\n")
		w.WriteHeader(http.StatusNotFound)
		return
	}

	tabsBackupJSON, _ := json.Marshal(tabsBackup)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(tabsBackupJSON)
}
