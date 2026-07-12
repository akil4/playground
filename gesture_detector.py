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
    Applies a velocity-adaptive Exponential Moving Average (EMA) to stabilize cursor movement.
    """
    def __init__(self, ema_alpha=0.35):
        """
        :param ema_alpha: Base/fallback smoothing factor.
        """
        self.base_alpha = ema_alpha
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
        # We check if the Tip is further from the Wrist than the PIP joint by a safety margin.
        # This margin prevents relaxed/partially bent fingers from triggering as "extended".
        fingers_up = []
        
        # Landmark mappings: (Tip, PIP)
        finger_indices = [
            (8, 6),   # Index
            (12, 10), # Middle
            (16, 14), # Ring
            (20, 18)  # Pinky
        ]
        
        # Dead-zone margin is 8% of the active hand scale
        margin = hand_scale * 0.08
        
        for tip, pip in finger_indices:
            dist_tip = math.hypot(lm_list[tip][1] - wrist[1], lm_list[tip][2] - wrist[2])
            dist_pip = math.hypot(lm_list[pip][1] - wrist[1], lm_list[pip][2] - wrist[2])
            
            # The tip must be significantly further than the PIP to be considered extended
            fingers_up.append(dist_tip > (dist_pip + margin))
            
        index_up, middle_up, ring_up, pinky_up = fingers_up

        # For the thumb (Tip 4, IP 3, MCP 2):
        # We check distance between Thumb Tip (4) and Index MCP (5).
        # If the thumb is tucked in, this distance is small.
        dist_thumb_to_index = math.hypot(lm_list[4][1] - lm_list[5][1], lm_list[4][2] - lm_list[5][2])
        thumb_up = dist_thumb_to_index > (hand_scale * 0.65) # Calibrated open threshold

        # 3. Detect Pinch Gesture (Thumb tip 4 and Index tip 8 touching)
        # We require a tight threshold (16% of hand scale) representing actual finger-tip contact.
        # Other fingers (middle, ring, pinky) must be closed to avoid false triggers during drawing.
        dist_thumb_index = math.hypot(lm_list[4][1] - lm_list[8][1], lm_list[4][2] - lm_list[8][2])
        is_pinching = (dist_thumb_index < hand_scale * 0.16) and not middle_up and not ring_up and not pinky_up

        # 4. Gesture Mapping Logic
        # - GESTURE_PINCH: Thumb and Index closed/touching, other fingers down
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
        Applies a Velocity-Adaptive Exponential Moving Average (EMA) to raw coordinates.
        This provides heavy stabilization during slow aims, and zero lag during fast strokes.
        
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

        # Calculate current displacement (velocity proxy)
        dx = raw_x - self.prev_x
        dy = raw_y - self.prev_y
        velocity = math.hypot(dx, dy)

        # Dynamic alpha calculation:
        # Stationary/Slow (velocity near 0) -> alpha is small (heavy smoothing, 0.15)
        # Fast motions (high velocity) -> alpha is high (maximum responsiveness, up to 0.85)
        min_alpha = 0.15
        max_alpha = 0.85
        velocity_scale = 0.015  # Rate at which responsiveness increases with speed
        
        adaptive_alpha = min_alpha + (velocity * velocity_scale)
        alpha = min(max_alpha, adaptive_alpha)

        # Apply Exponential Moving Average: S_t = alpha * Y_t + (1 - alpha) * S_{t-1}
        smooth_x = alpha * raw_x + (1.0 - alpha) * self.prev_x
        smooth_y = alpha * raw_y + (1.0 - alpha) * self.prev_y

        self.prev_x = smooth_x
        self.prev_y = smooth_y

        return int(smooth_x), int(smooth_y)

    def reset_smoothing(self):
        """Resets the moving average filter memory (useful when hand exits/re-enters the frame)."""
        self.prev_x = None
        self.prev_y = None
