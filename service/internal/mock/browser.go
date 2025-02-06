package mock

import "github.com/qbaware/kosher/internal/models"

const (
	BrowserID             = ""
	BrowserName           = ""
	BrowserBrowserType    = "Chrome"
	BrowserOS             = "MacOS"
	BrowserLastUpdateTime = "2021-08-01T00:00:00Z"
	BrowserUserID         = UserID
)

var (
	BrowserTabs = []models.Tab{
		{
			ID:   "0",
			Name: "How To Create Lego Star Wars",
			URL:  "https://www.youtube.com/watch?v=1",
		},
		{
			ID:   "1",
			Name: "Creating Discord Bots",
			URL:  "https://www.discord.com/developers",
		},
		{
			ID:   "2",
			Name: "Ehadom",
			URL:  "https://www.ehadom.com",
		},
		{
			ID:   "3",
			Name: "Home Assistant Eldom",
			URL:  "https://github.com/qbaware/homeassistant-eldom",
		},
	}
)
