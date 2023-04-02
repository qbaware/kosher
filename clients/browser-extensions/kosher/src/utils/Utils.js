/*global chrome*/

// TODO: Get those from a config file.
const clientId = "537590887046-6c985s5fp4qnph99vtsvmqgs07061gj5.apps.googleusercontent.com";
const scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
const redirectUrl = chrome.identity.getRedirectURL();

// TODO: Remove this at some point.
console.log(redirectUrl);

export const checkIfUserIsLoggedIn = async () => {
  switch (await getCurrentBrowser()) {
    case "Chrome":
      return await checkIfUserIsLoggedInChrome();
    case "Firefox":
      return await checkIfUserIsLoggedInFirefox(clientId, scopes, redirectUrl);
    default:
      throw new Error("Unknown browser");
  }
}

const checkIfUserIsLoggedInChrome = async () => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, token => {
      if (!token && chrome.runtime.lastError) {
        console.log("User is not logged in.");
        console.log(`Exception: ${JSON.stringify(chrome.runtime.lastError)}`);
        resolve(null);
      } else {
        console.log("User has already logged in.");
        resolve(token);
      }
    });
  });
}

const checkIfUserIsLoggedInFirefox = async (clientId, scopes, redirectUrl) => {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      url: `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token&scope=${scopes}&prompt=none`,
      interactive: false
    }).then((response) => {
      const urlParams = new URLSearchParams(response.substring(response.indexOf("#") + 1));

      const error = urlParams.get("error");
      if (!error) {
        console.log("User has already logged in.");
        const token = urlParams.get("access_token");
        console.log("Access token: " + token)
        resolve(token);
      } else {
        resolve(null);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

export const loginUser = async () => {
  switch (await getCurrentBrowser()) {
    case "Chrome":
      return await loginUserChrome();
    case "Firefox":
      return await loginUserFirefox(clientId, scopes, redirectUrl);
    default:
      throw new Error("Unknown browser");
  }
}

const loginUserChrome = async () => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

const loginUserFirefox = async (clientId, scopes, redirectUrl) => {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      url: `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token&scope=${scopes}`,
      interactive: true
    }).then((response) => {
      const urlParams = new URLSearchParams(response.substring(response.indexOf("#") + 1));

      const error = urlParams.get("error");
      if (!error) {
        const token = urlParams.get("access_token");
        resolve(token);
      } else {
        reject(error);
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

export const logoutUser = async () => {
  switch (await getCurrentBrowser()) {
    case "Chrome":
      return await logoutUserChrome();
    case "Firefox":
      return await logoutUserFirefox();
    default:
      throw new Error("Unknown browser");
  }
}

const logoutUserChrome = async () => {
  return new Promise((resolve, reject) => {
    // Check if user is logged in.
    checkIfUserIsLoggedIn()
      .then(token => {
        if (token) {
          // Clears token from the client.
          let localTokenClear = new Promise(function (resolve, _reject) {
            chrome.identity.clearAllCachedAuthTokens(() => {
              resolve();
            });
          });

          // Clears token from the server.
          let remoteTokenClear = revokeToken(token);

          // Wait for both promises to complete.
          Promise.all([localTokenClear, remoteTokenClear])
            .then(() => {
              console.log("Token cleared both locally and remotely.");
              resolve();
            })
            .catch(err => {
              console.log("An exception occured while deleting token locally and remotely.", err);
              reject(err);
            });
        } else {
          resolve();
        }
      }).catch(err => {
        console.log("An exception occured while trying to log out user.", err);
        reject(err);
      });
  });
}

const logoutUserFirefox = async () => {
  return new Promise((resolve, reject) => {
    checkIfUserIsLoggedIn()
      .then(token => {
        if (token) {
          revokeToken(token)
            .then(() => {
              console.log("Revoked token successfully.");
              resolve();
            })
            .catch(err => {
              console.log("An exception occured while deleting token locally and remotely.", err);
              reject(err);
            });
        } else {
          console.log("No token was present on user logout.");
          resolve();
        }
      }).catch(err => {
        console.log("An exception occured while trying to log out user.", err);
        reject(err);
      });
  });
}

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
