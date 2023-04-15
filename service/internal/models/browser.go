package models

var (
	supportedBrowsers = map[string]struct{}{
		"Chrome":  {},
		"Firefox": {},
		"Edge":    {},
	}
)

type Browser struct {
	ID          string `json:"id"`
	DeviceName  string `json:"device_name"`
	BrowserType string `json:"browser"`
	OS          string `json:"os"`
	Tabs        []Tab  `json:"tabs"`
}

func (b Browser) IsValid() bool {
	isNonEmpty := b.ID != "" &&
		b.DeviceName != "" &&
		b.BrowserType != "" &&
		b.OS != ""

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
