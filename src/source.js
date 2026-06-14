// Video input sources: webcam, video-file upload, drag & drop, pause/play.
import { CANVAS_W, CANVAS_H } from "./config.js";
import { state, toggleSide, toggleMirror } from "./state.js";
import * as ui from "./ui.js";

let bodyPose;

export function setBodyPose(bp) {
  bodyPose = bp;
}

function gotPoses(results) {
  state.poses = results;
}

export function initMode(p, selectedMode) {
  state.mode = selectedMode;
  ui.removeModeSelect();
  ui.showControls(p, { onToggleSide: toggleSide, onToggleMirror: toggleMirror });

  if (state.mode === "webcam") {
    state.scaleX = 1;
    state.scaleY = 1;
    state.video = p.createCapture(p.VIDEO);
    state.video.size(CANVAS_W, CANVAS_H);
    state.video.hide();
    bodyPose.detectStart(state.video, gotPoses);
    state.videoLoaded = true;
  } else {
    ui.showFileInput(p, (p5File) => {
      if (p5File.type === "video") loadVideoFile(p, p5File.file);
    });

    const canvas = p.select("canvas").elt;
    canvas.addEventListener("dragover", (e) => e.preventDefault());
    canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) loadVideoFile(p, file);
    });
  }
}

function loadVideoFile(p, nativeFile) {
  if (state.video) {
    state.video.stop();
    state.video.remove();
    state.poses = [];
  }

  const url = URL.createObjectURL(nativeFile);
  state.video = p.createVideo(url);
  state.video.elt.muted = true;
  state.video.elt.loop = true;
  state.video.hide();

  state.video.elt.addEventListener(
    "playing",
    () => {
      state.scaleX = CANVAS_W / state.video.elt.videoWidth;
      state.scaleY = CANVAS_H / state.video.elt.videoHeight;
      bodyPose.detectStart(state.video, gotPoses);
      state.videoLoaded = true;
      state.videoPaused = false;

      ui.removeFileInput();
      ui.showPausePlay(p, () => togglePause());
    },
    { once: true }
  );

  state.video.play();
}

function togglePause() {
  state.videoPaused = !state.videoPaused;
  if (state.videoPaused) {
    state.video.pause();
    ui.setPausePlayLabel("Play");
  } else {
    state.video.play();
    ui.setPausePlayLabel("Pause");
  }
}
