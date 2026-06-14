// Angle math in canvas space. `p` is the p5 instance; `p5.Vector` is the
// global static helper provided by the p5 CDN bundle.
import { mx, sy } from "./transform.js";

function canvasVector(p, point) {
  return p.createVector(mx(point.x), sy(point.y));
}

// Angle (degrees, always positive) at p2 formed by p1-p2-p3.
export function angleBetweenThreePoints(p, p1, p2, p3) {
  const v1 = p5.Vector.sub(canvasVector(p, p1), canvasVector(p, p2));
  const v2 = p5.Vector.sub(canvasVector(p, p3), canvasVector(p, p2));
  return Math.abs(p.degrees(v1.angleBetween(v2)));
}
