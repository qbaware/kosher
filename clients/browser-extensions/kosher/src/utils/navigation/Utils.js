/*global chrome*/

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
