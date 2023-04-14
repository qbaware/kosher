package models

import "github.com/google/uuid"

// Tab represents a browser tab object.
type Tab struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
	URL  string `json:"url,omitempty"`
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

// IsEmpty checks whether the object is empty or not.
func (tab Tab) IsEmpty() bool {
	return tab.ID == "" &&
		tab.Name == "" &&
		tab.URL == ""
}

// IsValid checks whether the object is valid or not.
func (tab Tab) IsValid() bool {
	return tab.ID != "" &&
		tab.URL != "" &&
		tab.Name != ""
}
