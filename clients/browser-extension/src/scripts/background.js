/*global chrome*/

import {
  getCurrentBrowser,
  getCurrentOs,
  loadVariableFromLocalStorage,
  localStorageBrowserTypeKey,
  localStorageDeviceName,
  localStorageExtensionId,
  localStorageOsKey,
  saveTabsToStorage,
  sendBrowserToRemote,
  loginUser,
  setVariableToLocalStorageIfMissing,
  localStorageSyncEnabledKey,
  refreshBrowsersFromRemote,
  refreshToken,
} from "./utils.js";

export const tabBackupAction = "tabsBackup";
export const browserBackupToRemoteAction = "browserBackupToRemote";
export const browserBackupRemoteActionFromUi = "browserBackupRemoteFromUi";
export const browsersFetchFromRemoteAndSaveAction =
  "browsersFetchFromRemoteAndSave";
export const refreshGoogleOAuth2TokenAction = "refreshGoogleOAuth2Token";
export const userLoginInteractive = "userLoginInteractive";

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension starting ...");

  const extensionId = crypto.randomUUID().substring(0, 10);
  setVariableToLocalStorageIfMissing(localStorageExtensionId, extensionId);
  try {
    let extensionId = await loadVariableFromLocalStorage(
      localStorageExtensionId
    );
    console.log("Loaded extension ID: " + extensionId);
  } catch (error) {
    console.error("Error while loading extension ID: " + error);
  }

  const deviceName = crypto.randomUUID().substring(0, 6).toUpperCase();
  setVariableToLocalStorageIfMissing(localStorageDeviceName, deviceName);
  try {
    let deviceName = await loadVariableFromLocalStorage(localStorageDeviceName);
    console.log("Loaded device name: " + deviceName);
  } catch (error) {
    console.error("Error while loading device name: " + error);
  }

  const browser = getCurrentBrowser();
  setVariableToLocalStorageIfMissing(localStorageBrowserTypeKey, browser);
  try {
    let browser = await loadVariableFromLocalStorage(
      localStorageBrowserTypeKey
    );
    console.log("Loaded browser: " + browser);
  } catch (error) {
    console.error("Error while loading browser: " + error);
  }

  try {
    let os = await getCurrentOs();
    setVariableToLocalStorageIfMissing(localStorageOsKey, os);

    os = await loadVariableFromLocalStorage(localStorageOsKey);
    console.log("Loaded OS: " + os);
  } catch (error) {
    console.log("Error while loading OS: " + error);
  }

  chrome.alarms.get(tabBackupAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(tabBackupAction, { periodInMinutes: 1 });
    }
  });

  chrome.alarms.get(browserBackupToRemoteAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(browserBackupToRemoteAction, {
        periodInMinutes: 180,
      });
    }
  });

  chrome.alarms.get(browsersFetchFromRemoteAndSaveAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(browsersFetchFromRemoteAndSaveAction, {
        periodInMinutes: 180,
      });
    }
  });

  chrome.alarms.get(refreshGoogleOAuth2TokenAction, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(refreshGoogleOAuth2TokenAction, {
        periodInMinutes: 20,
      });
    }
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case tabBackupAction:
      console.log("Periodic backup of tabs to local storage...");
      saveTabsToStorage();
      break;
    case browserBackupToRemoteAction:
      console.log("Periodic backup of current browser to remote...");
      try {
        let syncEnabled = await loadVariableFromLocalStorage(
          localStorageSyncEnabledKey
        );
        if (syncEnabled) {
          console.log("Sync enabled, sending browser to remote...");
          await sendBrowserToRemote();
        }
      } catch (error) {
        console.error(
          "Sync not enabled, skipping sending browser to remote: " + error
        );
      }
      break;
    case browsersFetchFromRemoteAndSaveAction:
      console.log(
        "Periodic fetch of browsers from remote and save to storage..."
      );
      await refreshBrowsersFromRemote();
      break;
    case refreshGoogleOAuth2TokenAction:
      console.log("Periodic refresh of Google OAuth2 token...");
      await refreshToken();
      break;
  }
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  switch (request.action) {
    case browserBackupRemoteActionFromUi:
      sendBrowserToRemote();
      break;
    case userLoginInteractive:
      loginUser(true);
      break;
  }
});
