// All canvas drawing. Every function takes the p5 instance `p`.
import { CANVAS_W, CANVAS_H, CONF_THRESHOLD, sideKeypoints, ANGLE_TRIPLES, COLORS } from "./config.js";
import { state } from "./state.js";
import { mx, sy } from "./transform.js";
import { angleBetweenThreePoints } from "./geometry.js";

const isVisible = (kp) => kp && kp.confidence > CONF_THRESHOLD;
const onCurrentSide = (name) => sideKeypoints[state.currentSide].includes(name);

export function drawCenteredMessage(p, lines, size) {
  p.background(...COLORS.background);
  p.fill(...COLORS.text);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(size);
  const startY = CANVAS_H / 2 - ((lines.length - 1) * size) / 2;
  lines.forEach((line, i) => p.text(line, CANVAS_W / 2, startY + i * size));
  p.textAlign(p.LEFT, p.BASELINE);
}

export function drawVideo(p) {
  p.push();
  if (state.mirrored) {
    p.translate(CANVAS_W, 0);
    p.scale(-1, 1);
  }
  p.image(state.video, 0, 0, CANVAS_W, CANVAS_H);
  p.pop();
}

function drawSkeleton(p, pose) {
  for (const [aIndex, bIndex] of state.connections) {
    const a = pose.keypoints[aIndex];
    const b = pose.keypoints[bIndex];
    if (isVisible(a) && isVisible(b) && onCurrentSide(a.name) && onCurrentSide(b.name)) {
      p.stroke(...COLORS.connection);
      p.strokeWeight(2);
      p.line(mx(a.x), sy(a.y), mx(b.x), sy(b.y));
    }
  }
}

function drawKeypoints(p, pose) {
  p.fill(...COLORS.keypoint);
  p.noStroke();
  for (const kp of pose.keypoints) {
    if (isVisible(kp) && onCurrentSide(kp.name)) {
      p.circle(mx(kp.x), sy(kp.y), 10);
    }
  }
  const nose = pose.keypoints.find((kp) => kp.name === "nose");
  if (isVisible(nose)) {
    p.circle(mx(nose.x), sy(nose.y), 15);
  }
}

function drawAngleArc(p, p1, p2, p3, angle) {
  const v1 = p5.Vector.sub(p.createVector(mx(p1.x), sy(p1.y)), p.createVector(mx(p2.x), sy(p2.y)));
  const v2 = p5.Vector.sub(p.createVector(mx(p3.x), sy(p3.y)), p.createVector(mx(p2.x), sy(p2.y)));
  const startAngle = v1.heading();
  const endAngle = v2.heading();
  const crossProductZ = v1.x * v2.y - v1.y * v2.x;

  p.push();
  p.noFill();
  p.stroke(...COLORS.arc);
  p.strokeWeight(2);
  if (crossProductZ < 0) {
    p.arc(mx(p2.x), sy(p2.y), 50, 50, endAngle, startAngle);
  } else {
    p.arc(mx(p2.x), sy(p2.y), 50, 50, startAngle, endAngle);
  }
  p.pop();

  p.fill(...COLORS.arc);
  p.noStroke();
  p.textSize(16);
  p.text(p.int(angle) + "°", mx(p2.x) + 30, sy(p2.y));
}

function drawAngles(p, pose) {
  const side = state.currentSide;
  const getKp = (suffix) => pose.keypoints.find((kp) => kp.name === `${side}_${suffix}`);

  for (const [aSuffix, bSuffix, cSuffix] of ANGLE_TRIPLES) {
    const a = getKp(aSuffix);
    const b = getKp(bSuffix);
    const c = getKp(cSuffix);
    if (isVisible(a) && isVisible(b) && isVisible(c)) {
      drawAngleArc(p, a, b, c, angleBetweenThreePoints(p, a, b, c));
    }
  }
}

export function drawPoses(p) {
  for (const pose of state.poses) {
    drawSkeleton(p, pose);
    drawKeypoints(p, pose);
    drawAngles(p, pose);
  }
}
