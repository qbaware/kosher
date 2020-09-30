const tabBackupAction = "tabs_backup"

chrome.alarms.create(tabBackupAction, {
    periodInMinutes: 1
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === tabBackupAction) {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                console.log(tab.favIconUrl + " " + tab.title + " " + tab.url)
            })
        })
    }
})
