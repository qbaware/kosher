/*global chrome*/

// TODO: Get those from a config file.
const clientId = "537590887046-6c985s5fp4qnph99vtsvmqgs07061gj5.apps.googleusercontent.com";
const scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
const redirectUrl = chrome.identity.getRedirectURL();

// TODO: Remove this at some point.
console.log(redirectUrl);

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

export const loginUser = () => {
  return loginUserWithClientCreds(clientId, scopes, redirectUrl);
}

const loginUserWithClientCreds = async (clientId, scopes, redirectUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await chrome.identity.launchWebAuthFlow({
        url: `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token&scope=${scopes}`,
        interactive: true
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
