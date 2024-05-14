let curr_tab = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "clearCookie") {
      clearCookies(curr_tab);
    } else if (message.action === "openFloatingPopup") {
      openFloatingPopup();
    }
  });
});

//function to get current tab data in which extension is open
getCurrentTabData = async ()=>{
   const tabs = await chrome.tabs.query({ active: true});

   if(!tabs){
    console.log("No tab is present !!");
    return;
  }

   const currentTab = tabs[0];
   return currentTab;
}

async function openFloatingPopup() {

  //get the current tab data in which extension is opend
  curr_tab = await getCurrentTabData();

  if(!curr_tab){
    console.log("unable to get the current tab !!");
  }

  console.log(curr_tab);

  // creating a new popup window
  const popupWidth = 600;
  const popupHeight = 450;

  const currentWindow = await new Promise((resolve) => {
    chrome.windows.getCurrent(resolve);
  });

  const leftPosition = Math.round(
    currentWindow.left + (currentWindow.width - popupWidth) / 2
  );
  const topPosition = Math.round(
    currentWindow.top + (currentWindow.height - popupHeight) / 2
  );
  chrome.windows.create(
    {
      url: chrome.runtime.getURL("track.html"),
      type: "popup",
      width: popupWidth,
      height: popupHeight,
      left: leftPosition,
      top: topPosition,
    },
    (newWindow) => {
      chrome.windows.update(newWindow.id, { focused: true });
    }
  );
}


const clearCookies = async (currentTab) => {

  const currentTabURL = currentTab.url;

  await chrome.browsingData.remove({
    "origins": [currentTabURL]
  }, {
    "cacheStorage": true,
    "cookies": true,
    "fileSystems": true,
    "indexedDB": true,
    "localStorage": true,
    "serviceWorkers": true,
    "webSQL": true
  }, function () {
      console.log("Cookies Cleared...");
      chrome.tabs.update(currentTab.id, { url: currentTabURL });
      console.log("User Logout!!");
    });
}



// async function clearCookies() {
//   const tabs = await chrome.tabs.query({ active: true});
//   const currentTab = tabs[0];
//   const currentTabURL = currentTab.url;

//   chrome.browsingData.remove({
//     "origins": [currentTabURL]
//   }, {
//     "cacheStorage": true,
//     "cookies": true,
//     "fileSystems": true,
//     "indexedDB": true,
//     "localStorage": true,
//     "serviceWorkers": true,
//     "webSQL": true
//   }, function () {
//       console.log("Cookies Cleared...");
//       chrome.tabs.update(currentTab.id, { url: currentTabURL });
//       console.log("User Logout!!");
//     });
// }


