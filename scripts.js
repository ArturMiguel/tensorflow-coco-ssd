const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const enableWebcamButton = document.getElementById("webcamButton");

let model = undefined;

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
});

function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  window.alert("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
  if (!model) {
    return;
  }

  event.target.classList.add("removed");

  const constraints = {
    video: true
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let children = [];

function predictWebcam() {

  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      console.log(predictions)
      // If we are over 50% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.50) {
        const p = document.createElement("p");
        p.innerText = `${predictions[n].class} - ${Math.round(parseFloat(predictions[n].score) * 100)}%`;
        p.style = `font-size: 18px; font-weight: bold; margin-left: ${predictions[n].bbox[0]}px; margin-top: ${predictions[n].bbox[1] - 10}px; width: ${predictions[n].bbox[2] - 10}px; top: 0; left: 0;`;

        const highlighter = document.createElement("div");
        highlighter.setAttribute("class", "highlighter");
        highlighter.style = `left: ${predictions[n].bbox[0]}px; top: ${predictions[n].bbox[1]}px; width: ${predictions[n].bbox[2]}px; height: ${predictions[n].bbox[3]}px;`;
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}