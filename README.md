# Radler

A real-time bike fit tool that uses your webcam and pose detection to measure joint angles while you ride.

## What it does

Radler overlays your live webcam feed with skeleton tracking and displays joint angles at key positions:

- **Elbow** — shoulder → elbow → wrist
- **Knee** — hip → knee → ankle
- **Hip** — shoulder → hip → knee
- **Armpit** — hip → shoulder → elbow

These angles help you assess and dial in your cycling position without needing an in-person fitter.

## Tech

- [p5.js](https://p5js.org/) — canvas rendering
- [ml5.js](https://ml5js.org/) — body pose detection (MoveNet)
- [Vite](https://vitejs.dev/) — dev server

## Getting started

```bash
npm install
npm run dev
```

Open your browser and allow webcam access. Point the camera at yourself from the side for best results.

## Controls

| Button | Action |
|--------|--------|
| Toggle Side | Switch between tracking left or right body side |
| Mirror | Flip the video horizontally (on by default) |

## Tips

- Shoot from a true side profile for accurate angle readings
- Make sure you're well-lit so the model can detect keypoints confidently
- Keypoints with confidence below 10% are filtered out and won't render
