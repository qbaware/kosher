/*global chrome*/

const CLIENT_ID = process.env.REACT_APP_GOOGLE_OAUTH2_CLIENT_ID;
const SCOPES = process.env.REACT_APP_GOOGLE_OAUTH2_SCOPES;
const REDIRECT_URL = chrome.identity.getRedirectURL();

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

export const loginUser = (interactive) => {
  return loginUserWithClientCreds(CLIENT_ID, SCOPES, REDIRECT_URL, interactive);
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

export const revokeToken = async (token) => {
  fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
}

export const getCurrentOs = async () => {
  const platformInfo = await chrome.runtime.getPlatformInfo();
  switch (platformInfo.os) {
    case "mac":
      return "MacOS";
    case "windows":
      return "Windows";
    default:
      return "Unknown";
  }
}

export const getCurrentBrowser = async () => {
  const redirectUrl = await chrome.identity.getRedirectURL();
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

export const openLink = (link) => {
  const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
}
