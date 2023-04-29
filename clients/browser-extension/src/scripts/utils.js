/*global chrome*/

// TODO: See how to get those from a secure config
const kosherBrowsersApiUrl = "https://kosher.herokuapp.com/browsers";
const clientId = "537590887046-6c985s5fp4qnph99vtsvmqgs07061gj5.apps.googleusercontent.com";
const scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
const redirectUrl = chrome.identity.getRedirectURL();

export const localStorageTabsKey = "tabs";
export const localStorageToken = "token";
export const localStorageExtensionId = "extensionId";
export const localStorageDeviceName = "deviceName";
export const localStorageOsKey = "os";
export const localStorageBrowserTypeKey = "browserType";
export const localStorageSyncEnabledKey = "syncEnabled";

export const loginUser = (interactive) => {
  return loginUserWithClientCreds(clientId, scopes, redirectUrl, interactive);
}

const loginUserWithClientCreds = async (clientId, scopes, redirectUrl, interactive) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await chrome.identity.launchWebAuthFlow({
        url: `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token&scope=${scopes}`,
        interactive: interactive
      });
      const urlParams = new URLSearchParams(response.substring(response.indexOf("#") + 1));
      const error = urlParams.get("error");
      if (!error) {
        const token = urlParams.get("access_token");
        await chrome.storage.local.set({ token: token });
        console.log("Saved token into storage");
        console.log("Received token: " + token);
        resolve(token);
      } else {
        console.log("Error while logging in with Google: " + error);
        reject(error);
      }
    } catch (error) {
      console.log("Error while logging in: " + error);
      reject(error);
    }
  });
}

export const checkUserLogin = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let tokenResult = await chrome.storage.local.get("token");
      let token = tokenResult.token;
      if (!token) {
        resolve(null);
        return;
      }
      console.log("Found token in storage:" + token);
      resolve(token);
    } catch (error) {
      console.log("Error while checking for token in storage: " + error);
      reject(error);
    }
  });
}

export const logoutUser = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let token = await checkUserLogin();
      if (!token) {
        console.log("No token was present on user logout");
        resolve();
        return;
      }

      await revokeToken(token);
      console.log("Revoked token successfully");

      await chrome.storage.local.remove("token");
      console.log("Token cleaned from storage");

      console.log("User logged out successfully");
      resolve();
    } catch (error) {
      console.log("An exception occured while trying to log out user", error);
      reject(error);
    }
  });
};

const revokeToken = (token) => {
  return fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
}

export const getTokenUserInfo = (token) => {
  return fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`);
}

const checkTokenValidity = (token) => {
  return fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
    .then((response) => {
      return response.ok;
    }).catch((_error) => {
      return false;
    });
}

export const openLink = (link) => {
  const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
}

export function setVariableToLocalStorage(variableName, variableValue) {
  let storage = {};
  storage[variableName] = variableValue;
  chrome.storage.local.set(storage);
}

export function setVariableToLocalStorageIfMissing(variableName, variableValue) {
  chrome.storage.local.get(variableName, (result) => {
    if (!result[variableName]) {
      setVariableToLocalStorage(variableName, variableValue);
    }
  });
}

export function loadVariableFromLocalStorage(variableName) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(variableName, (result) => {
      if (result[variableName]) {
        resolve(result[variableName]);
      } else {
        reject("Variable " + variableName + " not found in local storage");
      }
    });
  });
}

export async function getCurrentOs() {
  return chrome.runtime.getPlatformInfo()
    .then((platformInfo) => {
      switch (platformInfo.os) {
        case "mac":
          return "MacOS";
        case "windows":
          return "Windows";
        default:
          return "Unknown";
      }
    }).catch((error) => {
      console.log("Error while getting OS: " + error);
      return "Unknown";
    });
}

export function getCurrentBrowser() {
  const redirectUrl = chrome.identity.getRedirectURL();
  if (redirectUrl.includes("chromium")) {
    if (navigator.userAgent.includes("Edg")) {
      return "Edge";
    }
    return "Chrome";
  } else if (redirectUrl.includes("allizom")) {
    return "Firefox";
  } else {
    return "Unknown";
  }
}

export function saveTabsToStorage() {
  chrome.tabs.query({}, (tabs) => {
    tabs = tabs.map((tab) => {
      return {
        id: String(tab.id),
        name: tab.title,
        url: tab.url,
      };
    });
    console.log("Found %d tabs, putting them to local storage...", tabs.length);
    setVariableToLocalStorage(localStorageTabsKey, tabs);
  });
}

export function sendTabsToRemote() {
  Promise.all([
    loadVariableFromLocalStorage(localStorageExtensionId),
    loadVariableFromLocalStorage(localStorageTabsKey),
    loadVariableFromLocalStorage(localStorageOsKey),
    loadVariableFromLocalStorage(localStorageBrowserTypeKey),
    loadVariableFromLocalStorage(localStorageDeviceName),
    loadVariableFromLocalStorage(localStorageToken)
  ]).then(async (values) => {
    let [extensionId, tabs, os, browserType, deviceName, token] = values;

    const isTokenValid = await checkTokenValidity(token);
    if (!isTokenValid) {
      console.log("Token is invalid, trying to refresh it...");
      try {
        await loginUser(false);
        token = await loadVariableFromLocalStorage(localStorageToken);
      } catch (error) {
        console.log("Error while refreshing token so aborting sending tabs to remote...");
        return;
      }
    }

    const dataJson = JSON.stringify({
      id: extensionId,
      name: deviceName,
      browser: browserType,
      os: os,
      tabs: tabs
    });

    console.log("Sending browser data to server... ");
    fetch(kosherBrowsersApiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: dataJson
    }).then((response) => {
      console.log("Server responded with status code: " + response.status);
    }).catch((error) => {
      console.log("Error while sending browser data to server: " + error);
    });
  }).catch((error) => {
    console.log("Error while retrieving data from storage: " + error);
  });
}

export function fetchBrowsersFromRemote() {
  return new Promise(async (resolve, reject) => {
    console.log("Fetching user's browsers from remote...");
    try {
      const token = await loadVariableFromLocalStorage(localStorageToken);
      const response = await fetch(kosherBrowsersApiUrl, {
        method: "GET",
        headers: {
          "Authorization": token
        }
      });

      if (response.status !== 200) {
        reject("Server responded with non-OK status code on fetching browsers from remote: " + response.status)
        return;
      }

      const browsers = await response.json();
      resolve(browsers);
    } catch (error) {
      reject("Error while fetching browsers from remote: " + error);
      return;
    }
  });
}

export function deleteBrowsersFromRemote(browersIds) {
  return new Promise(async (resolve, reject) => {
    console.log("Deleting browsers from remote...");
    try {
      const token = await loadVariableFromLocalStorage(localStorageToken);
      const response = await fetch(kosherBrowsersApiUrl, {
        method: "DELETE",
        headers: {
          "Authorization": token
        },
        body: JSON.stringify(browersIds)
      });

      if (response.status !== 200) {
        reject("Server responded with non-OK status code on fetching browsers from remote: " + response.status)
        return;
      }

      resolve();
    } catch (error) {
      reject("Error while fetching browsers from remote: " + error);
      return;
    }
  });
}
