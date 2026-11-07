// main.js
import { HandTracker } from './HandTracker.js';
import { GestureDetector, GESTURE_DRAW, GESTURE_SELECT, GESTURE_FIST, GESTURE_PINCH, GESTURE_UNKNOWN } from './GestureDetector.js';
import { CanvasManager } from './CanvasManager.js';
import { UIManager } from './UIManager.js';

// DOM Elements
const video = document.getElementById('webcam');
const trackingCanvas = document.getElementById('tracking-canvas');
const trackingCtx = trackingCanvas.getContext('2d');
const drawingCanvas = document.getElementById('drawing-canvas');

// Modules
let tracker, detector, canvasMgr, uiMgr;

// State
let lastVideoTime = -1;
let prevGesture = GESTURE_UNKNOWN;
let prevCursor = null;
let shapeStart = null;

async function init() {
  console.log("Initializing handSketch Web...");

  // Setup Canvas and UI
  canvasMgr = new CanvasManager(drawingCanvas);
  uiMgr = new UIManager();
  
  // Connect clear/save buttons
  document.getElementById('btn-clear').addEventListener('click', () => canvasMgr.clear());
  document.getElementById('btn-save').addEventListener('click', () => canvasMgr.save());

  // Setup Tracking Canvas size
  window.addEventListener('resize', () => {
    trackingCanvas.width = window.innerWidth;
    trackingCanvas.height = window.innerHeight;
    canvasMgr.resize(window.innerWidth, window.innerHeight);
  });
  trackingCanvas.width = window.innerWidth;
  trackingCanvas.height = window.innerHeight;

  // Initialize Tracker
  tracker = new HandTracker();
  await tracker.initialize();

  // Initialize Detector
  detector = new GestureDetector(0.35);

  // Setup Webcam
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: "user" }
    });
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  } catch (err) {
    console.error("Webcam access denied or unavailable:", err);
    alert("Could not access webcam. Please allow permissions.");
  }
}

function predictWebcam() {
  let startTimeMs = performance.now();
  
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    
    const results = tracker.detect(video, startTimeMs);
    
    // Clear tracking canvas (for cursor and shape preview)
    trackingCtx.clearRect(0, 0, trackingCanvas.width, trackingCanvas.height);
    
    let currentGesture = GESTURE_UNKNOWN;
    let cursor = null;

    if (results && results.landmarks && results.landmarks.length > 0) {
      // Get first hand
      const landmarks = results.landmarks[0];
      
      // Map normalized coordinates [0,1] to screen pixels.
      // Remember the video is flipped horizontally via CSS, so we must flip the X coordinate logically
      const rawX = (1 - landmarks[8].x) * window.innerWidth;
      const rawY = landmarks[8].y * window.innerHeight;
      
      const gestureResult = detector.detectGesture(landmarks);
      currentGesture = gestureResult.gesture;
      
      cursor = detector.getSmoothedCursor(rawX, rawY);
      
      // Render landmarks (optional debug)
      // drawLandmarks(trackingCtx, landmarks);
    } else {
      detector.resetSmoothing();
    }

    uiMgr.updateStatus(currentGesture);

    // STATE MACHINE LOGIC
    if (prevGesture === GESTURE_DRAW && currentGesture !== GESTURE_DRAW) {
      if (['line', 'rect', 'circle'].includes(uiMgr.activeTool)) {
        canvasMgr.commitShape(shapeStart, prevCursor, uiMgr.activeTool);
      }
      shapeStart = null;
    }

    if (currentGesture === GESTURE_FIST) {
      prevCursor = null;
      uiMgr.checkHover(null, null);
    } 
    else if (currentGesture === GESTURE_SELECT) {
      prevCursor = null;
      shapeStart = null;
      uiMgr.checkHover(cursor?.x, cursor?.y);
    }
    else if (currentGesture === GESTURE_PINCH) {
      prevCursor = null;
      shapeStart = null;
      uiMgr.triggerPinch(cursor?.x, cursor?.y);
    }
    else if (currentGesture === GESTURE_DRAW) {
      uiMgr.checkHover(null, null);
      if (cursor) {
        // Block drawing over UI (top 150px)
        if (cursor.y > 150) {
          if (uiMgr.activeTool === 'pen' || uiMgr.activeTool === 'eraser') {
            canvasMgr.drawFreehand(prevCursor, cursor, uiMgr.activeTool === 'eraser');
          } else {
            if (!shapeStart) shapeStart = { x: cursor.x, y: cursor.y };
            canvasMgr.drawShapePreview(trackingCtx, shapeStart, cursor, uiMgr.activeTool);
          }
        } else {
          // Inside UI area, break stroke
          prevCursor = null;
        }
      }
      prevCursor = cursor;
    } else {
      prevCursor = null;
      uiMgr.checkHover(null, null);
    }

    prevGesture = currentGesture;

    // Draw visual cursor
    if (cursor) {
      drawCursor(trackingCtx, cursor.x, cursor.y, currentGesture, uiMgr);
    }
  }
  
  // Loop
  window.requestAnimationFrame(predictWebcam);
}

function drawCursor(ctx, x, y, gesture, ui) {
  ctx.beginPath();
  if (gesture === GESTURE_SELECT) {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
    ctx.stroke();
  } else if (gesture === GESTURE_DRAW) {
    ctx.strokeStyle = ui.activeTool === 'eraser' ? '#aaa' : ui.activeColor;
    ctx.lineWidth = 2;
    const size = ui.activeTool === 'eraser' ? canvasMgr.eraserSize/2 : canvasMgr.brushSize/2;
    ctx.arc(x, y, Math.max(4, size), 0, 2*Math.PI);
    ctx.stroke();
    // Inner dot
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y, 2, 0, 2*Math.PI);
    ctx.fill();
  } else if (gesture === GESTURE_PINCH) {
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y + 8);
    ctx.moveTo(x + 8, y - 8); ctx.lineTo(x - 8, y + 8);
    ctx.stroke();
  }
}

// Start
init();
