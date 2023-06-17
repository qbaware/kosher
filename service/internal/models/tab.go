package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

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

func (b *Tab) Scan(value interface{}) error {
	// Convert the database value to a []byte.
	data, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan Tab object")
	}

	// Deserialize the JSON data into the tab object.
	return json.Unmarshal(data, &b)
}

func (b Tab) Value() (driver.Value, error) {
	// Serialize the tabs slice to JSON.
	data, err := json.Marshal(b)
	if err != nil {
		return nil, err
	}

	// Return the JSON data as a string.
	return driver.Value(string(data)), nil
}
