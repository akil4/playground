import math

# Define gesture constants for clear state mapping
GESTURE_FIST = "fist"        # Hover/Idle/Pause
GESTURE_DRAW = "draw"        # Drawing mode (Index finger up)
GESTURE_SELECT = "select"    # Selection mode (Index + Middle up)
GESTURE_PINCH = "pinch"      # Selection confirm / click (Thumb + Index touching)
GESTURE_UNKNOWN = "unknown"  # Unrecognized finger combination

class GestureDetector:
    """
    Analyzes landmark lists from HandTracker to identify high-level gestures.
    Also handles coordinate smoothing (stabilization) using an Exponential Moving Average (EMA).
    """
    def __init__(self, ema_alpha=0.3):
        """
        :param ema_alpha: Smoothing factor between 0.0 (max smoothing, laggy) and 1.0 (no smoothing, jittery).
        """
        self.ema_alpha = ema_alpha
        self.prev_x = None
        self.prev_y = None

    def detect_gesture(self, lm_list):
        """
        Detects hand gesture from the 21 landmarks.
        Uses hand-size normalization for robust thresholding at varying distances from the webcam.
        
        :param lm_list: List of [id, x, y] landmarks.
        :return: A tuple of (gesture_name, debug_info_dict)
        """
        if not lm_list or len(lm_list) < 21:
            return GESTURE_UNKNOWN, {}

        # 1. Compute hand scale/size for distance-independent thresholds
        # We use the distance between Wrist (0) and Middle finger MCP (9) as a scale baseline.
        wrist = lm_list[0]
        middle_mcp = lm_list[9]
        hand_scale = math.hypot(wrist[1] - middle_mcp[1], wrist[2] - middle_mcp[2])
        if hand_scale == 0:
            hand_scale = 1.0

        # 2. Determine if fingers are extended (up) or folded (down)
        # We compare the distance of each finger's tip to the wrist vs the PIP joint to the wrist.
        # This is more robust to rotation and tilt than checking if Tip Y < PIP Y.
        fingers_up = []
        
        # We check four main fingers: Index, Middle, Ring, Pinky
        # Landmark mappings: (Tip, PIP)
        finger_indices = [
            (8, 6),   # Index
            (12, 10), # Middle
            (16, 14), # Ring
            (20, 18)  # Pinky
        ]
        
        for tip, pip in finger_indices:
            dist_tip = math.hypot(lm_list[tip][1] - wrist[1], lm_list[tip][2] - wrist[2])
            dist_pip = math.hypot(lm_list[pip][1] - wrist[1], lm_list[pip][2] - wrist[2])
            # If Tip is further from Wrist than PIP, the finger is extended
            fingers_up.append(dist_tip > dist_pip)
            
        index_up, middle_up, ring_up, pinky_up = fingers_up

        # For the thumb (Tip 4, IP 3, MCP 2):
        # The thumb moves horizontally; we compare the distance between Thumb Tip (4) and Index MCP (5).
        # If it's small, the thumb is tucked in (closed).
        dist_thumb_to_index = math.hypot(lm_list[4][1] - lm_list[5][1], lm_list[4][2] - lm_list[5][2])
        thumb_up = dist_thumb_to_index > (hand_scale * 0.6) # Dynamic thumb-open threshold

        # 3. Detect Pinch Gesture (Thumb tip 4 and Index tip 8 touching)
        # Often used as a clicking gesture. We require other fingers (middle, ring, pinky) to be closed.
        dist_thumb_index = math.hypot(lm_list[4][1] - lm_list[8][1], lm_list[4][2] - lm_list[8][2])
        is_pinching = (dist_thumb_index < hand_scale * 0.28) and not middle_up and not ring_up and not pinky_up

        # 4. Gesture Mapping Logic
        # - GESTURE_PINCH: Thumb and Index close, other fingers closed
        if is_pinching:
            return GESTURE_PINCH, {"dist": dist_thumb_index, "scale": hand_scale}

        # - GESTURE_DRAW: Index finger up, Middle, Ring, Pinky down
        if index_up and not middle_up and not ring_up and not pinky_up:
            return GESTURE_DRAW, {}

        # - GESTURE_SELECT: Index and Middle fingers up, Ring, Pinky down
        if index_up and middle_up and not ring_up and not pinky_up:
            return GESTURE_SELECT, {}

        # - GESTURE_FIST: All four main fingers closed
        if not index_up and not middle_up and not ring_up and not pinky_up:
            return GESTURE_FIST, {}

        return GESTURE_UNKNOWN, {}

    def get_smoothed_cursor(self, raw_coord):
        """
        Applies Exponential Moving Average (EMA) to raw coordinates to smooth out jitter.
        :param raw_coord: Tuple (x, y) of raw tracked index tip coordinates.
        :return: Tuple (smooth_x, smooth_y) of stabilized coordinates.
        """
        if raw_coord is None:
            self.reset_smoothing()
            return None

        raw_x, raw_y = raw_coord
        if self.prev_x is None or self.prev_y is None:
            self.prev_x = raw_x
            self.prev_y = raw_y
            return raw_x, raw_y

        # Exponential Moving Average Formula: S_t = alpha * Y_t + (1 - alpha) * S_{t-1}
        smooth_x = self.ema_alpha * raw_x + (1.0 - self.ema_alpha) * self.prev_x
        smooth_y = self.ema_alpha * raw_y + (1.0 - self.ema_alpha) * self.prev_y

        self.prev_x = smooth_x
        self.prev_y = smooth_y

        return int(smooth_x), int(smooth_y)

    def reset_smoothing(self):
        """Resets the moving average filter memory (useful when hand exits/re-enters the frame)."""
        self.prev_x = None
        self.prev_y = None
