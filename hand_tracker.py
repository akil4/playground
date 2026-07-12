import cv2
import os
import urllib.request
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import mediapipe as mp

class HandTracker:
    """
    A class to handle hand detection and tracking using the modern MediaPipe Tasks API.
    It automatically downloads the required hand_landmarker.task model file locally,
    extracts 21 landmark points from the hand, and renders hand joints and lines.
    """
    def __init__(self, mode=False, max_hands=1, detection_confidence=0.75, tracking_confidence=0.5):
        """
        Initializes the MediaPipe Tasks hand model.
        :param mode: Not used in modern API (kept for signature compatibility).
        :param max_hands: Maximum number of hands to detect.
        :param detection_confidence: Minimum confidence value for hand detection.
        :param tracking_confidence: Minimum confidence value for hand tracking.
        """
        self.model_path = "hand_landmarker.task"
        self._ensure_model_exists()

        # Configure and initialize the hand landmarker detector
        base_options = python.BaseOptions(model_asset_path=self.model_path)
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE, # synchronous image-based inference
            num_hands=max_hands,
            min_hand_detection_confidence=detection_confidence,
            min_hand_presence_confidence=tracking_confidence
        )
        self.detector = vision.HandLandmarker.create_from_options(options)
        self.latest_result = None

    def _ensure_model_exists(self):
        """Checks if the hand landmarker task file is present locally, downloading it if necessary."""
        if not os.path.exists(self.model_path):
            print(f"[HandTracker] Model '{self.model_path}' not found locally.")
            print("[HandTracker] Downloading hand_landmarker.task from Google APIs...")
            url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
            
            try:
                # Add a browser User-Agent header to avoid any HTTP block
                req = urllib.request.Request(
                    url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                )
                with urllib.request.urlopen(req) as response, open(self.model_path, 'wb') as out_file:
                    out_file.write(response.read())
                print("[HandTracker] Model downloaded successfully.")
            except Exception as e:
                print(f"[HandTracker] Error downloading model: {e}")
                raise e

    def find_hands(self, img, draw=True):
        """
        Processes the image to detect hands.
        :param img: BGR frame from OpenCV.
        :param draw: Boolean, if True draws landmarks on the image.
        :return: Image (with landmarks drawn if requested).
        """
        # Convert BGR OpenCV image to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Wrap the NumPy frame inside a MediaPipe Image object
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        
        # Process detection synchronously
        self.latest_result = self.detector.detect(mp_image)

        if draw:
            self.draw_landmarks(img)
            
        return img

    def get_landmarks(self, img, hand_idx=0):
        """
        Extracts landmark coordinates for a specific hand.
        :param img: Image frame to map normalized coordinates to pixels.
        :param hand_idx: Index of the detected hand (0 for first hand).
        :return: A list of 21 elements, where each element is [id, x, y].
        """
        lm_list = []
        if self.latest_result and self.latest_result.hand_landmarks:
            if hand_idx < len(self.latest_result.hand_landmarks):
                hand_lms = self.latest_result.hand_landmarks[hand_idx]
                h, w, c = img.shape
                for id, lm in enumerate(hand_lms):
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    lm_list.append([id, cx, cy])
        return lm_list

    def draw_landmarks(self, img):
        """
        Custom drawing utility for hand landmarks and connections using standard OpenCV tools.
        Avoids dependency on the deprecated mp.solutions.drawing_utils.
        """
        if not self.latest_result or not self.latest_result.hand_landmarks:
            return

        h, w, c = img.shape

        # Mappings of landmark point connections (Wrist -> Fingers)
        connections = [
            # Thumb
            (0, 1), (1, 2), (2, 3), (3, 4),
            # Index
            (5, 6), (6, 7), (7, 8),
            # Middle
            (9, 10), (10, 11), (11, 12),
            # Ring
            (13, 14), (14, 15), (15, 16),
            # Pinky
            (17, 18), (18, 19), (19, 20),
            # Palm borders / Knuckles
            (0, 5), (5, 9), (9, 13), (13, 17), (0, 17)
        ]

        for hand_lms in self.latest_result.hand_landmarks:
            # 1. Draw connection lines
            for pt1_idx, pt2_idx in connections:
                lm1 = hand_lms[pt1_idx]
                lm2 = hand_lms[pt2_idx]
                x1, y1 = int(lm1.x * w), int(lm1.y * h)
                x2, y2 = int(lm2.x * w), int(lm2.y * h)
                # Draw lines in deep red color with anti-aliasing
                cv2.line(img, (x1, y1), (x2, y2), (0, 0, 220), 2, cv2.LINE_AA)

            # 2. Draw joints (landmarks)
            for id, lm in enumerate(hand_lms):
                cx, cy = int(lm.x * w), int(lm.y * h)
                # Draw bright green circle with dark outline for high contrast visibility
                cv2.circle(img, (cx, cy), 5, (0, 255, 0), cv2.FILLED, cv2.LINE_AA)
                cv2.circle(img, (cx, cy), 5, (0, 120, 0), 1, cv2.LINE_AA)
