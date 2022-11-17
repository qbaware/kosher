const tabBackupAction = "tabs_backup";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension starting ...");
});

chrome.alarms.create(tabBackupAction, {
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === tabBackupAction) {
    chrome.tabs.query({}, (tabs) => {
      console.log("Found %d tabs.", tabs.length);

      tabs.forEach(tab => {
        const tabInfo = tab.favIconUrl + " " + tab.title + " " + tab.url;
      });
    });
  }
});
