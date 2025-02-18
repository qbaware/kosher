package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

var (
	supportedBrowsers = map[string]struct{}{
		"Chrome":  {},
		"Firefox": {},
		"Edge":    {},
	}
)

type Tabs []Tab

// Browser represents a browser with all its tabs.
type Browser struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	BrowserType    string `json:"browser"`
	OS             string `json:"os"`
	LastUpdateTime string `json:"last_update_time"`
	Tabs           Tabs   `json:"tabs"`
	UserID         string `json:"user_id"`
}

// IsValid checks if a browser is valid.
func (b Browser) IsValid() bool {
	isNonEmpty := b.ID != "" &&
		b.Name != "" &&
		b.BrowserType != "" &&
		b.OS != "" &&
		b.LastUpdateTime != ""

	_, isBrowserSupported := supportedBrowsers[b.BrowserType]

	areTabsValid := true
	for _, tab := range b.Tabs {
		if !tab.IsValid() {
			areTabsValid = false
			break
		}
	}

	return isNonEmpty &&
		isBrowserSupported &&
		areTabsValid
}

func (b Tabs) Value() (driver.Value, error) {
	// Serialize the tabs slice to JSON.
	data, err := json.Marshal(b)
	if err != nil {
		return nil, err
	}

	// Return the JSON data as a string.
	return driver.Value(data), nil
}

func (b *Tabs) Scan(value interface{}) error {
	// Convert the database value to a []byte.
	data, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan Tab object")
	}

	// Deserialize the JSON data into the tab object.
	return json.Unmarshal(data, &b)
}
