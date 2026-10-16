
import {
  FilesetResolver,
  HandLandmarker
} from "@mediapipe/tasks-vision";

let handLandmarker = null;

export async function initializeHandDetector() {
  if (handLandmarker) {
    return handLandmarker;
  }

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.65,
      minHandPresenceConfidence: 0.65,
      minTrackingConfidence: 0.65
    }
  );

  return handLandmarker;
}

export function detectHand(video, timestamp) {
  if (!handLandmarker) {
    throw new Error("Hand detector has not been initialized.");
  }

  return handLandmarker.detectForVideo(video, timestamp);
}

export function closeHandDetector() {
  handLandmarker?.close();
  handLandmarker = null;
}
