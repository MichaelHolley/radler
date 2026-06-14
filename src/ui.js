// DOM controls (p5 buttons / file input). `p` is the p5 instance.
import { CANVAS_W, CANVAS_H } from "./config.js";

let modeWebcamBtn, modeVideoBtn;
let toggleBtn, mirrorBtn, pausePlayBtn, fileInputBtn;

export function showModeSelect(p, onSelect) {
  modeWebcamBtn = p.createButton("Webcam");
  modeWebcamBtn.position(CANVAS_W / 2 - 85, CANVAS_H / 2);
  modeWebcamBtn.size(80, 40);
  modeWebcamBtn.mousePressed(() => onSelect("webcam"));

  modeVideoBtn = p.createButton("Video File");
  modeVideoBtn.position(CANVAS_W / 2 + 5, CANVAS_H / 2);
  modeVideoBtn.size(80, 40);
  modeVideoBtn.mousePressed(() => onSelect("video"));
}

export function removeModeSelect() {
  modeWebcamBtn?.remove();
  modeVideoBtn?.remove();
}

export function showControls(p, { onToggleSide, onToggleMirror }) {
  toggleBtn = p.createButton("Toggle Side");
  toggleBtn.position(10, 10);
  toggleBtn.mousePressed(onToggleSide);

  mirrorBtn = p.createButton("Mirror");
  mirrorBtn.position(110, 10);
  mirrorBtn.mousePressed(onToggleMirror);
}

export function showFileInput(p, onSelect) {
  fileInputBtn = p.createFileInput(onSelect);
  fileInputBtn.position(210, 10);
}

export function removeFileInput() {
  fileInputBtn?.remove();
  fileInputBtn = null;
}

// Creates the pause/play button if needed, or resets its label to "Pause".
export function showPausePlay(p, onToggle) {
  if (!pausePlayBtn) {
    pausePlayBtn = p.createButton("Pause");
    pausePlayBtn.position(210, 10);
    pausePlayBtn.mousePressed(onToggle);
  } else {
    pausePlayBtn.html("Pause");
  }
}

export function setPausePlayLabel(label) {
  pausePlayBtn?.html(label);
}
