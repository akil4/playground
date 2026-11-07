// GestureDetector.js
export const GESTURE_UNKNOWN = "UNKNOWN";
export const GESTURE_DRAW = "DRAW";
export const GESTURE_SELECT = "SELECT";
export const GESTURE_FIST = "FIST";
export const GESTURE_PINCH = "PINCH";

export class GestureDetector {
  constructor(emaAlpha = 0.35) {
    this.emaAlpha = emaAlpha;
    this.prevCursor = null;
  }

  detectGesture(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return { gesture: GESTURE_UNKNOWN };
    }

    // MediaPipe Hands landmarks mapping
    // 0: WRIST, 4: THUMB_TIP, 8: INDEX_FINGER_TIP, 12: MIDDLE_FINGER_TIP, 16: RING_FINGER_TIP, 20: PINKY_TIP
    const tipIds = [4, 8, 12, 16, 20];
    
    // We determine if fingers are up by comparing the y-coordinate of the tip with a lower joint
    // For JS, origin (0,0) is top-left, so smaller y means higher on screen.
    // Thumb is a bit different, we can check x-coordinate distance to wrist or use simplified logic
    let fingersUp = [];
    
    // Thumb: compare x or y based on hand orientation, simpler: just check y against joint 2 for now
    if (landmarks[tipIds[0]].y < landmarks[3].y) {
      fingersUp.push(1);
    } else {
      fingersUp.push(0);
    }
    
    // Other fingers
    for (let i = 1; i < 5; i++) {
      if (landmarks[tipIds[i]].y < landmarks[tipIds[i] - 2].y) {
        fingersUp.push(1);
      } else {
        fingersUp.push(0);
      }
    }

    const [thumb, index, middle, ring, pinky] = fingersUp;
    
    // Calculate pinch distance between thumb (4) and index (8)
    const tx = landmarks[4].x;
    const ty = landmarks[4].y;
    const ix = landmarks[8].x;
    const iy = landmarks[8].y;
    const pinchDist = Math.sqrt((tx - ix) ** 2 + (ty - iy) ** 2);
    
    // Calculate hand scale based on wrist to middle finger MCP
    const wx = landmarks[0].x;
    const wy = landmarks[0].y;
    const mx = landmarks[9].x;
    const my = landmarks[9].y;
    const handScale = Math.sqrt((wx - mx) ** 2 + (wy - my) ** 2);
    
    // Calibration threshold from Python version (0.16)
    const isPinching = pinchDist < (handScale * 0.16);

    // FIST: No fingers up
    if (index === 0 && middle === 0 && ring === 0 && pinky === 0) {
      return { gesture: GESTURE_FIST };
    }
    
    // PINCH
    if (isPinching) {
      return { gesture: GESTURE_PINCH };
    }
    
    // SELECT: Index and Middle up
    if (index === 1 && middle === 1 && ring === 0 && pinky === 0) {
      return { gesture: GESTURE_SELECT };
    }
    
    // DRAW: Only Index up
    if (index === 1 && middle === 0 && ring === 0 && pinky === 0) {
      return { gesture: GESTURE_DRAW };
    }

    return { gesture: GESTURE_UNKNOWN };
  }

  getSmoothedCursor(rawX, rawY) {
    if (!this.prevCursor) {
      this.prevCursor = { x: rawX, y: rawY };
      return this.prevCursor;
    }
    
    // Adaptive smoothing could be implemented here based on velocity
    const dist = Math.sqrt((rawX - this.prevCursor.x) ** 2 + (rawY - this.prevCursor.y) ** 2);
    
    // Simple EMA
    let alpha = this.emaAlpha;
    if (dist > 50) alpha = 0.8; // Move fast
    else if (dist < 5) alpha = 0.1; // Move slow, stabilize
    
    const smoothX = this.prevCursor.x * (1 - alpha) + rawX * alpha;
    const smoothY = this.prevCursor.y * (1 - alpha) + rawY * alpha;
    
    this.prevCursor = { x: smoothX, y: smoothY };
    return this.prevCursor;
  }

  resetSmoothing() {
    this.prevCursor = null;
  }
}
