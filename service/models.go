package main

// Tab represents a browser tab object.
type Tab struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// HasRequiredFields checks whether all required fields are available.
func (tab Tab) HasRequiredFields() bool {
	return tab.Name != "" && tab.URL != ""
}
