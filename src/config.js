// Static configuration — no p5/ml5 dependencies.

export const CANVAS_W = 960;
export const CANVAS_H = 720;

// Keypoints below this confidence are filtered out and not rendered.
export const CONF_THRESHOLD = 0.1;

// Keypoint names grouped by body side, used to render one side at a time.
export const sideKeypoints = {
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

// Joint angles to measure, expressed as [a, b, c] keypoint suffixes where the
// angle is measured at the middle point b. Side prefix is applied at runtime.
export const ANGLE_TRIPLES = [
  ["shoulder", "elbow", "wrist"], // elbow
  ["hip", "knee", "ankle"], // knee
  ["shoulder", "hip", "knee"], // hip
  ["hip", "shoulder", "elbow"], // armpit
];

export const COLORS = {
  background: [30],
  text: [255],
  connection: [255, 0, 0],
  keypoint: [0, 255, 0],
  arc: [255, 255, 255],
};
