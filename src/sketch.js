// Entry point: wires p5 (instance mode) to the app modules.
// `p5` and `ml5` are globals provided by the CDN scripts in index.html.
import { CANVAS_W, CANVAS_H } from "./config.js";
import { state } from "./state.js";
import { initMode, setBodyPose } from "./source.js";
import { showModeSelect } from "./ui.js";
import { drawCenteredMessage, drawVideo, drawPoses } from "./render.js";

const sketch = (p) => {
  let bodyPose;

  p.preload = () => {
    bodyPose = ml5.bodyPose();
    setBodyPose(bodyPose);
  };

  p.setup = () => {
    p.createCanvas(CANVAS_W, CANVAS_H);
    state.connections = bodyPose.getConnections();
    showModeSelect(p, (mode) => initMode(p, mode));
  };

  p.draw = () => {
    if (state.mode === null) {
      drawCenteredMessage(p, ["Select Input Source"], 28);
      return;
    }
    if (!state.videoLoaded) {
      drawCenteredMessage(p, ["Select a video file or drag & drop onto canvas"], 20);
      return;
    }
    drawVideo(p);
    drawPoses(p);
  };
};

new p5(sketch);
