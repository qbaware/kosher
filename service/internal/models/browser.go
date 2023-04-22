package models

var (
	supportedBrowsers = map[string]struct{}{
		"Chrome":  {},
		"Firefox": {},
		"Edge":    {},
	}
)

// Browser represents a browser with all its tabs.
type Browser struct {
	ID             string `json:"id"`
	DeviceName     string `json:"device_name"`
	BrowserType    string `json:"browser"`
	OS             string `json:"os"`
	LastUpdateTime string `json:"last_update_time"`
	Tabs           []Tab  `json:"tabs"`
}

// IsValid checks if a browser is valid.
func (b Browser) IsValid() bool {
	isNonEmpty := b.ID != "" &&
		b.DeviceName != "" &&
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
