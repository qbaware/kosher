package main

import "fmt"

const maxTabBackups int = 1000

var tabsBackupStorage [][]Tab

// BackupTabs adds new the new tabs backup to the storage.
func BackupTabs(tabs []Tab) {
	if len(tabsBackupStorage) >= maxTabBackups {
		tabsBackupStorage = tabsBackupStorage[:len(tabsBackupStorage)-1]
	}

	tabsBackupStorage = append(tabsBackupStorage, tabs)
}

// RetrieveTabsBackup retrieves a backup by index starting from the last one.
func RetrieveTabsBackup(index int) ([]Tab, error) {
	if index >= 0 && index <= len(tabsBackupStorage)-1 {
		return tabsBackupStorage[index], nil
	}

	return []Tab{}, fmt.Errorf("error: no such backup is available")
}
