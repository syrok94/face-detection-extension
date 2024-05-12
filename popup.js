const openCustomPage = async () => {
  try {
    await chrome.runtime.sendMessage({ action: "openFloatingPopup" });
  } catch (error) {
    const container = document.getElementById("errorContainer");
    container.height = 30;
    container.width = 240;
    const pp = document.getElementById("error");
    pp.innerText = "Error : Refresh Extension and Run Again";
    console.warn(error);
  }
};

openCustomPage();
