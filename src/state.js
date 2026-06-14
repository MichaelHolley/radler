// Mutable application state shared across modules.
export const state = {
  video: null,
  poses: [],
  connections: null,
  currentSide: "left", // 'left' | 'right'
  mirrored: true,
  mode: null, // 'webcam' | 'video'
  videoLoaded: false,
  videoPaused: false,
  scaleX: 1, // source-pixel -> canvas-pixel scale
  scaleY: 1,
};

export function toggleSide() {
  state.currentSide = state.currentSide === "left" ? "right" : "left";
}

export function toggleMirror() {
  state.mirrored = !state.mirrored;
}
