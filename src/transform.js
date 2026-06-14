// Maps source-video coordinates onto canvas coordinates, accounting for the
// source/canvas scale and the optional horizontal mirror.
import { state } from "./state.js";
import { CANVAS_W } from "./config.js";

export function mx(x) {
  const sx = x * state.scaleX;
  return state.mirrored ? CANVAS_W - sx : sx;
}

export function sy(y) {
  return y * state.scaleY;
}
