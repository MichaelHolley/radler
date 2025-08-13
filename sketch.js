let video;
let bodyPose;
let poses = [];
let connections;

let currentSide = "left"; // 'left' or 'right'
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
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeletal connection information
  connections = bodyPose.getConnections();

  // Create a button to toggle the side
  let toggleButton = createButton("Toggle Side");
  toggleButton.position(10, 10); // Adjust position as needed
  toggleButton.mousePressed(toggleSide);
}

function toggleSide() {
  currentSide = currentSide === "left" ? "right" : "left";
  console.log("Current side:", currentSide);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw the skeleton connections
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];

      // Check if both points are confident enough and on the current side
      const isPointAOnCurrentSide = sideKeypoints[currentSide].includes(
        pointA.name
      );
      const isPointBOnCurrentSide = sideKeypoints[currentSide].includes(
        pointB.name
      );

      if (
        pointA.confidence > 0.1 &&
        pointB.confidence > 0.1 &&
        isPointAOnCurrentSide &&
        isPointBOnCurrentSide
      ) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }

  // Draw all the tracked landmark points and the head keypoint
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];

    // Draw side-specific keypoints
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];

      // Check if the keypoint's confidence is bigger than 0.1 and on the current side
      const isKeypointOnCurrentSide = sideKeypoints[currentSide].includes(
        keypoint.name
      );

      if (keypoint.confidence > 0.1 && isKeypointOnCurrentSide) {
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 10);
      }
    }

    // Draw the head keypoint (nose)
    let noseKeypoint = pose.keypoints.find((kp) => kp.name === "nose");
    if (noseKeypoint && noseKeypoint.confidence > 0.1) {
      fill(0, 255, 0); // Green color for head
      noStroke();
      circle(noseKeypoint.x, noseKeypoint.y, 15); // Slightly larger circle for head
    }
  }
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
