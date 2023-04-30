/*global chrome*/

import { getCurrentBrowser, getCurrentOs, loadVariableFromLocalStorage, localStorageBrowserTypeKey, localStorageDeviceName, localStorageExtensionId, localStorageOsKey, saveTabsToStorage, sendBrowserToRemote, setVariableToLocalStorageIfMissing, localStorageSyncEnabledKey, refreshBrowsersFromRemote } from "./utils.js";

export const tabBackupAction = "tabsBackup";
export const browserBackupToRemoteAction = "browserBackupToRemote";
export const browserBackupRemoteActionFromUi = "browserBackupRemoteFromUi";
export const browsersFetchFromRemoteAndSaveAction = "browsersFetchFromRemoteAndSave";

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
  chrome.alarms.get(browserBackupToRemoteAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(browserBackupToRemoteAction, { periodInMinutes: 30 });
    }
  });
  chrome.alarms.get(browsersFetchFromRemoteAndSaveAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(browsersFetchFromRemoteAndSaveAction, { periodInMinutes: 30 });
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case tabBackupAction:
      console.log("Periodic backup of tabs to local storage...");
      saveTabsToStorage();
      break;
    case browserBackupToRemoteAction:
      console.log("Periodic backup of current browser to remote...");

      loadVariableFromLocalStorage(localStorageSyncEnabledKey)
        .then((syncEnabled) => {
          if (syncEnabled) {
            console.log("Sync enabled, sending browser to remote...")
            sendBrowserToRemote();
          }
        }).catch((_error) => {
          console.log("Sync not enabled, skipping sending browser to remote...")
        });

      break;
    case browsersFetchFromRemoteAndSaveAction:
      console.log("Periodic fetch of browsers from remote and save to storage...");
      refreshBrowsersFromRemote();
      break;
  }
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  switch (request.action) {
    case browserBackupRemoteActionFromUi:
      sendBrowserToRemote();
      break;
  }
});
