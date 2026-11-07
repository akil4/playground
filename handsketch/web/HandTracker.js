// HandTracker.js
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export class HandTracker {
  constructor() {
    this.handLandmarker = null;
    this.runningMode = "VIDEO";
  }

  async initialize() {
    // Load the vision tasks fileset
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: this.runningMode,
      numHands: 1,
      minHandDetectionConfidence: 0.75,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.6
    });
    
    console.log("HandLandmarker initialized.");
  }

  detect(videoElement, timestamp) {
    if (!this.handLandmarker) return null;
    return this.handLandmarker.detectForVideo(videoElement, timestamp);
  }
}
