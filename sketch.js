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
  createCanvas(960, 720);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(960, 720);
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

// Helper function to calculate angle between three points (p1-p2-p3)
function angleBetweenThreePoints(p1, p2, p3) {
  const v1 = p5.Vector.sub(createVector(p1.x, p1.y), createVector(p2.x, p2.y));
  const v2 = p5.Vector.sub(createVector(p3.x, p3.y), createVector(p2.x, p2.y));
  let angle = v1.angleBetween(v2);
  angle = degrees(angle); // Convert to degrees
  return abs(angle);
}

// Helper function to draw an arc for the angle
function drawAngleArc(p1, p2, p3, angle) {
  let v1 = p5.Vector.sub(createVector(p1.x, p1.y), createVector(p2.x, p2.y));
  let v2 = p5.Vector.sub(createVector(p3.x, p3.y), createVector(p2.x, p2.y));

  let startAngle = v1.heading();
  let endAngle = v2.heading();

  // Determine if the arc should be drawn clockwise or counter-clockwise
  // based on the cross product of v1 and v2.
  // A positive z-component means v2 is counter-clockwise from v1.
  // A negative z-component means v2 is clockwise from v1.
  let crossProductZ = v1.x * v2.y - v1.y * v2.x;

  push();
  noFill();
  stroke(255, 255, 255); // White color for angle arc
  strokeWeight(2);

  if (crossProductZ < 0) {
    // v2 is clockwise from v1
    arc(p2.x, p2.y, 50, 50, endAngle, startAngle); // Swap to draw clockwise
  } else {
    // v2 is counter-clockwise from v1
    arc(p2.x, p2.y, 50, 50, startAngle, endAngle);
  }
  pop();

  // Display the angle value
  fill(255, 255, 255); // White color for text
  noStroke();
  textSize(16);
  text(int(angle) + "°", p2.x + 30, p2.y);
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

    // --- Draw Angles ---
    const getKp = (name) => pose.keypoints.find((kp) => kp.name === name);

    // Elbow (inside): shoulder - elbow - wrist
    let shoulderKp = getKp(`${currentSide}_shoulder`);
    let elbowKp = getKp(`${currentSide}_elbow`);
    let wristKp = getKp(`${currentSide}_wrist`);

    if (
      shoulderKp &&
      elbowKp &&
      wristKp &&
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

    // Knee (back): hip - knee - ankle
    let hipKp = getKp(`${currentSide}_hip`);
    let kneeKp = getKp(`${currentSide}_knee`);
    let ankleKp = getKp(`${currentSide}_ankle`);

    if (
      hipKp &&
      kneeKp &&
      ankleKp &&
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

    // Hip (front): shoulder - hip - knee
    // This assumes the angle at the hip formed by shoulder, hip, and knee
    if (
      shoulderKp &&
      hipKp &&
      kneeKp &&
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

    // Armpit (inside): hip - shoulder - elbow
    // This measures the angle between the torso and the upper arm
    if (
      hipKp &&
      shoulderKp &&
      elbowKp &&
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

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
