/*global chrome*/

import { getCurrentBrowser, getCurrentOs, loadVariableFromLocalStorage, localStorageBrowserTypeKey, localStorageDeviceName, localStorageExtensionId, localStorageOsKey, saveTabsToStorage, sendTabsToRemote, setVariableToLocalStorageIfMissing, localStorageSyncEnabledKey } from "./utils.js";

export const tabBackupAction = "tabsBackup";
export const tabBackupRemoteAction = "tabsBackupRemote";
export const tabBackupRemoteActionFromUi = "tabsBackupRemoteFromUi";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension starting ...");

  const extensionId = crypto.randomUUID().substring(0, 10);
  setVariableToLocalStorageIfMissing(localStorageExtensionId, extensionId);
  loadVariableFromLocalStorage(localStorageExtensionId)
    .then((extensionId) => {
      console.log("Loaded extension ID: " + extensionId);
    }).catch((error) => {
      console.log("Error while loading extension ID: " + error);
    });

  const deviceName = crypto.randomUUID().substring(0, 6).toUpperCase();
  setVariableToLocalStorageIfMissing(localStorageDeviceName, deviceName);
  loadVariableFromLocalStorage(localStorageDeviceName)
    .then((deviceName) => {
      console.log("Loaded device name: " + deviceName);
    }).catch((error) => {
      console.log("Error while loading device name: " + error);
    });

  const browser = getCurrentBrowser();
  setVariableToLocalStorageIfMissing(localStorageBrowserTypeKey, browser);
  loadVariableFromLocalStorage(localStorageBrowserTypeKey)
    .then((browser) => {
      console.log("Loaded browser: " + browser);
    }).catch((error) => {
      console.log("Error while loading browser: " + error);
    });

  getCurrentOs()
    .then((os) => {
      setVariableToLocalStorageIfMissing(localStorageOsKey, os);
      loadVariableFromLocalStorage(localStorageOsKey)
        .then((os) => {
          console.log("Loaded OS: " + os);
        }).catch((error) => {
          console.log("Error while loading OS: " + error);
        });
    });

  chrome.alarms.get(tabBackupAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(tabBackupAction, { periodInMinutes: 1 });
    }
  });
  chrome.alarms.get(tabBackupRemoteAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(tabBackupRemoteAction, { periodInMinutes: 15 });
    }
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case tabBackupAction:
      console.log("Periodic backup of tabs to local storage...");
      saveTabsToStorage();
      break;
    case tabBackupRemoteAction:
      console.log("Periodic backup of tabs to remote...");

      const syncEnabled = await loadVariableFromLocalStorage(localStorageSyncEnabledKey);
      if (!syncEnabled) {
        console.log("Sync is disabled, aborting sending tabs to remote...");
        break;
      }

      sendTabsToRemote();
      break;
  }
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  switch (request.action) {
    case tabBackupRemoteActionFromUi:
      sendTabsToRemote();
      break;
  }
});
