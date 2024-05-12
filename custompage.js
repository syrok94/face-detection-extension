let videoStream;
const videoElement = document.getElementById("videoElement");
let isFaceFound = true;
let timerId;
let faceTimerId;
const faceAbsentThreshold = 3000;

//Loading face detection apis
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]);


// camera capture logic
const startWebcamCapture = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Webcam started");
    videoStream = stream;
    videoElement.srcObject = stream;
    videoElement.width = 300;
    videoElement.height = 200;
    videoElement.style.display = "block";
  } catch (error) {
    console.error("Error starting webcam:", error);
  }
};


//face detection logic..
const startFaceDetection = () => {
  videoElement.addEventListener("play", () => {
    console.log("Face Detection Started...");
    const canvas = faceapi.createCanvasFromMedia(videoElement);
    document.body.append(canvas);

    const displaySize = {
      width: videoElement.width,
      height: videoElement.height,
    };

    faceapi.matchDimensions(canvas, displaySize);

    timerId = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detections.length) {
        if (!faceTimerId) {
          startFaceAbsentTimer();
        }
      } else {
        isFaceFound = true;
        console.log("face detected : ", detections);
        if (faceTimerId) {
          stopFaceAbsentTimer();
        }
      }
    }, 100);
  });
};


// stop timer when no face detected for 3 seconds
const startFaceAbsentTimer = () => {
  faceTimerId = setTimeout(() => {
    console.log(
      `No face detected for ${
        faceAbsentThreshold / 1000
      } seconds: Stopping timer...`
    );
    clearInterval(timerId);
    // send message to clear cookies
    chrome.runtime.sendMessage({ action: "clearCookie" });
    //stop the webcam 
    stopWebcamCapture();

  }, faceAbsentThreshold);
};


//reset the timer if a face is detected
const stopFaceAbsentTimer = () => {
  clearTimeout(faceTimerId);
  faceTimerId = null;
};


//clear the video stream once no face detected
const stopWebcamCapture = () => {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
    videoElement.srcObject = null;
    videoElement.width = 0;
    videoElement.height = 0;
    console.log("Webcam stopped");
  }
};


// logic to toggle pip mode
const togglePiPMode = async () => {
  if (!videoElement.srcObject) {
    console.warn("No video stream available.");
    return;
  }

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoElement.requestPictureInPicture();
    }
  } catch (error) {
    console.error("Error toggling Picture-in-Picture mode:", error);
  }
};


//start facedetection and webcapture simulataneously
Promise.all([startFaceDetection(), startWebcamCapture()]);

//pip mode button
document.getElementById("pip").addEventListener("click", () => {
  togglePiPMode();
});


