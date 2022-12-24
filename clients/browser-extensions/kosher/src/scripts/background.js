const tabBackupAction = "tabs_backup";
const localStorageTabsKey = "tabs";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension starting ...");
});

chrome.alarms.create(tabBackupAction, {
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === tabBackupAction) {
    chrome.tabs.query({}, (tabs) => {
      console.log("Found %d tabs. Putting them to local storage.", tabs.length);
      chrome.storage.local.set({ localStorageTabsKey: tabs });
    });
  }
});
