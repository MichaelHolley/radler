let video;
let bodyPose;
let poses = [];
let connections;

let currentSide = "left";
let mirrored = true;
let mode = null; // 'webcam' or 'video'
let videoLoaded = false;
let videoPaused = false;
let scaleX = 1;
let scaleY = 1;

let modeWebcamBtn, modeVideoBtn;
let toggleBtn, mirrorBtn, pausePlayBtn, fileInputBtn;

const sideKeypoints = {
  left: [
    "left_shoulder",
    "left_elbow",
    "left_wrist",
    "left_hip",
    "left_knee",
    "left_ankle",
  ],
  right: [
    "right_shoulder",
    "right_elbow",
    "right_wrist",
    "right_hip",
    "right_knee",
    "right_ankle",
  ],
};

function preload() {
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(960, 720);
  connections = bodyPose.getConnections();

  modeWebcamBtn = createButton("Webcam");
  modeWebcamBtn.position(width / 2 - 85, height / 2);
  modeWebcamBtn.size(80, 40);
  modeWebcamBtn.mousePressed(() => initMode("webcam"));

  modeVideoBtn = createButton("Video File");
  modeVideoBtn.position(width / 2 + 5, height / 2);
  modeVideoBtn.size(80, 40);
  modeVideoBtn.mousePressed(() => initMode("video"));
}

function initMode(selectedMode) {
  mode = selectedMode;
  modeWebcamBtn.remove();
  modeVideoBtn.remove();

  toggleBtn = createButton("Toggle Side");
  toggleBtn.position(10, 10);
  toggleBtn.mousePressed(toggleSide);

  mirrorBtn = createButton("Mirror");
  mirrorBtn.position(110, 10);
  mirrorBtn.mousePressed(toggleMirror);

  if (mode === "webcam") {
    scaleX = 1;
    scaleY = 1;
    video = createCapture(VIDEO);
    video.size(960, 720);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
    videoLoaded = true;
  } else {
    fileInputBtn = createFileInput(handleFileSelect);
    fileInputBtn.position(210, 10);

    let canvas = select("canvas").elt;
    canvas.addEventListener("dragover", (e) => e.preventDefault());
    canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      let file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) loadVideoFile(file);
    });
  }
}

function handleFileSelect(p5File) {
  if (p5File.type === "video") {
    loadVideoFile(p5File.file);
  }
}

function loadVideoFile(nativeFile) {
  if (video) {
    video.stop();
    video.remove();
    poses = [];
  }
  let url = URL.createObjectURL(nativeFile);
  video = createVideo(url);
  video.elt.muted = true;
  video.elt.loop = true;
  video.hide();

  video.elt.addEventListener("playing", () => {
    scaleX = width / video.elt.videoWidth;
    scaleY = height / video.elt.videoHeight;
    bodyPose.detectStart(video, gotPoses);
    videoLoaded = true;
    videoPaused = false;

    if (fileInputBtn) {
      fileInputBtn.remove();
      fileInputBtn = null;
    }
    if (!pausePlayBtn) {
      pausePlayBtn = createButton("Pause");
      pausePlayBtn.position(210, 10);
      pausePlayBtn.mousePressed(togglePause);
    } else {
      pausePlayBtn.html("Pause");
    }
  }, { once: true });

  video.play();
}

function togglePause() {
  videoPaused = !videoPaused;
  if (videoPaused) {
    video.pause();
    pausePlayBtn.html("Play");
  } else {
    video.play();
    pausePlayBtn.html("Pause");
  }
}

function toggleSide() {
  currentSide = currentSide === "left" ? "right" : "left";
}

function toggleMirror() {
  mirrored = !mirrored;
}

function mx(x) {
  let sx = x * scaleX;
  return mirrored ? width - sx : sx;
}

function sy(y) {
  return y * scaleY;
}

function angleBetweenThreePoints(p1, p2, p3) {
  const v1 = p5.Vector.sub(createVector(mx(p1.x), sy(p1.y)), createVector(mx(p2.x), sy(p2.y)));
  const v2 = p5.Vector.sub(createVector(mx(p3.x), sy(p3.y)), createVector(mx(p2.x), sy(p2.y)));
  let angle = v1.angleBetween(v2);
  angle = degrees(angle);
  return abs(angle);
}

function drawAngleArc(p1, p2, p3, angle) {
  let v1 = p5.Vector.sub(createVector(mx(p1.x), sy(p1.y)), createVector(mx(p2.x), sy(p2.y)));
  let v2 = p5.Vector.sub(createVector(mx(p3.x), sy(p3.y)), createVector(mx(p2.x), sy(p2.y)));

  let startAngle = v1.heading();
  let endAngle = v2.heading();

  let crossProductZ = v1.x * v2.y - v1.y * v2.x;

  push();
  noFill();
  stroke(255, 255, 255);
  strokeWeight(2);

  if (crossProductZ < 0) {
    arc(mx(p2.x), sy(p2.y), 50, 50, endAngle, startAngle);
  } else {
    arc(mx(p2.x), sy(p2.y), 50, 50, startAngle, endAngle);
  }
  pop();

  fill(255, 255, 255);
  noStroke();
  textSize(16);
  text(int(angle) + "°", mx(p2.x) + 30, sy(p2.y));
}

function draw() {
  if (mode === null) {
    background(30);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(28);
    text("Select Input Source", width / 2, height / 2 - 50);
    textAlign(LEFT, BASELINE);
    return;
  }

  if (!videoLoaded) {
    background(30);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Select a video file or drag & drop onto canvas", width / 2, height / 2);
    textAlign(LEFT, BASELINE);
    return;
  }

  push();
  if (mirrored) {
    translate(width, 0);
    scale(-1, 1);
  }
  image(video, 0, 0, width, height);
  pop();

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];

      const isPointAOnCurrentSide = sideKeypoints[currentSide].includes(pointA.name);
      const isPointBOnCurrentSide = sideKeypoints[currentSide].includes(pointB.name);

      if (
        pointA.confidence > 0.1 &&
        pointB.confidence > 0.1 &&
        isPointAOnCurrentSide &&
        isPointBOnCurrentSide
      ) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(mx(pointA.x), sy(pointA.y), mx(pointB.x), sy(pointB.y));
      }
    }
  }

  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      const isKeypointOnCurrentSide = sideKeypoints[currentSide].includes(keypoint.name);

      if (keypoint.confidence > 0.1 && isKeypointOnCurrentSide) {
        fill(0, 255, 0);
        noStroke();
        circle(mx(keypoint.x), sy(keypoint.y), 10);
      }
    }

    let noseKeypoint = pose.keypoints.find((kp) => kp.name === "nose");
    if (noseKeypoint && noseKeypoint.confidence > 0.1) {
      fill(0, 255, 0);
      noStroke();
      circle(mx(noseKeypoint.x), sy(noseKeypoint.y), 15);
    }

    const getKp = (name) => pose.keypoints.find((kp) => kp.name === name);

    let shoulderKp = getKp(`${currentSide}_shoulder`);
    let elbowKp = getKp(`${currentSide}_elbow`);
    let wristKp = getKp(`${currentSide}_wrist`);

    if (
      shoulderKp && elbowKp && wristKp &&
      shoulderKp.confidence > 0.1 &&
      elbowKp.confidence > 0.1 &&
      wristKp.confidence > 0.1 &&
      sideKeypoints[currentSide].includes(shoulderKp.name) &&
      sideKeypoints[currentSide].includes(elbowKp.name) &&
      sideKeypoints[currentSide].includes(wristKp.name)
    ) {
      let angle = angleBetweenThreePoints(shoulderKp, elbowKp, wristKp);
      drawAngleArc(shoulderKp, elbowKp, wristKp, angle);
    }

    let hipKp = getKp(`${currentSide}_hip`);
    let kneeKp = getKp(`${currentSide}_knee`);
    let ankleKp = getKp(`${currentSide}_ankle`);

    if (
      hipKp && kneeKp && ankleKp &&
      hipKp.confidence > 0.1 &&
      kneeKp.confidence > 0.1 &&
      ankleKp.confidence > 0.1 &&
      sideKeypoints[currentSide].includes(hipKp.name) &&
      sideKeypoints[currentSide].includes(kneeKp.name) &&
      sideKeypoints[currentSide].includes(ankleKp.name)
    ) {
      let angle = angleBetweenThreePoints(hipKp, kneeKp, ankleKp);
      drawAngleArc(hipKp, kneeKp, ankleKp, angle);
    }

    if (
      shoulderKp && hipKp && kneeKp &&
      shoulderKp.confidence > 0.1 &&
      hipKp.confidence > 0.1 &&
      kneeKp.confidence > 0.1 &&
      sideKeypoints[currentSide].includes(shoulderKp.name) &&
      sideKeypoints[currentSide].includes(hipKp.name) &&
      sideKeypoints[currentSide].includes(kneeKp.name)
    ) {
      let angle = angleBetweenThreePoints(shoulderKp, hipKp, kneeKp);
      drawAngleArc(shoulderKp, hipKp, kneeKp, angle);
    }

    if (
      hipKp && shoulderKp && elbowKp &&
      hipKp.confidence > 0.1 &&
      shoulderKp.confidence > 0.1 &&
      elbowKp.confidence > 0.1 &&
      sideKeypoints[currentSide].includes(hipKp.name) &&
      sideKeypoints[currentSide].includes(shoulderKp.name) &&
      sideKeypoints[currentSide].includes(elbowKp.name)
    ) {
      let angle = angleBetweenThreePoints(hipKp, shoulderKp, elbowKp);
      drawAngleArc(hipKp, shoulderKp, elbowKp, angle);
    }
  }
}

function gotPoses(results) {
  poses = results;
}
