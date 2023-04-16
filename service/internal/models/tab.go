package models

import "github.com/google/uuid"

// Tab represents a browser tab object.
type Tab struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

// NewTab creates a new tab.
func NewTab(name, url string) Tab {
	id := uuid.NewString()

	return Tab{
		ID:   id,
		Name: name,
		URL:  url,
	}
}

// IsValid checks whether the object is valid or not.
func (tab Tab) IsValid() bool {
	return tab.ID != "" &&
		tab.URL != "" &&
		tab.Name != ""
}
