package models

// Tab represents a browser tab object.
type Tab struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

// IsValid checks whether the object is valid or not.
func (tab Tab) IsValid() bool {
	return tab.ID != "" &&
		tab.URL != "" &&
		tab.Name != ""
}
