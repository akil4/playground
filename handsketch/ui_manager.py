import cv2
import numpy as np
import math

class UIManager:
    """
    Renders the UI toolbar overlay (tools, colors, sizes, actions) on the screen.
    Tracks cursor hover durations to trigger 'dwell-clicking' without requiring physical input.
    """
    def __init__(self, width=1280, height=110):
        self.width = width
        self.height = height
        
        # Define layout parameters
        self.btn_y1 = 15
        self.btn_y2 = 65
        self.dwell_threshold = 12  # Number of frames to trigger dwell click (~0.4s at 30 FPS)
        
        # Active settings
        self.active_tool = "pen"       # 'pen', 'eraser', 'line', 'rect', 'circle'
        self.active_color = (0, 0, 255) # BGR Red
        self.active_size = 8           # Default pen brush size
        
        # Hover state
        self.hover_btn_id = None
        self.hover_count = 0
        
        # Color definitions
        self.colors_map = {
            "Red": (0, 0, 255),
            "Green": (0, 255, 0),
            "Blue": (255, 0, 0),
            "Yellow": (0, 255, 255),
            "Cyan": (255, 255, 0),
            "Magenta": (255, 0, 255),
            "White": (255, 255, 255)
        }

        # Initialize button coordinate maps
        self.buttons = []
        self._init_buttons()

    def _init_buttons(self):
        """Initializes the toolbar layout grid of buttons."""
        self.buttons = []
        
        # Group 1: Tools (Pen, Eraser, Line, Rect, Circle)
        tools = [
            {"id": "pen", "name": "Pen", "type": "tool", "value": "pen"},
            {"id": "eraser", "name": "Eraser", "type": "tool", "value": "eraser"},
            {"id": "line", "name": "Line", "type": "tool", "value": "line"},
            {"id": "rect", "name": "Rect", "type": "tool", "value": "rect"},
            {"id": "circle", "name": "Circle", "type": "tool", "value": "circle"}
        ]
        
        x_start = 15
        spacing = 75
        for i, t in enumerate(tools):
            x1 = x_start + i * spacing
            x2 = x1 + 65
            t.update({"x1": x1, "y1": self.btn_y1, "x2": x2, "y2": self.btn_y2})
            self.buttons.append(t)

        # Group 2: Sizes (Thin, Med, Thick)
        sizes = [
            {"id": "size_thin", "name": "Thin", "type": "size", "value": 4},
            {"id": "size_med", "name": "Med", "type": "size", "value": 8},
            {"id": "size_thick", "name": "Thick", "type": "size", "value": 16}
        ]
        x_start = 405
        spacing = 65
        for i, s in enumerate(sizes):
            x1 = x_start + i * spacing
            x2 = x1 + 55
            s.update({"x1": x1, "y1": self.btn_y1, "x2": x2, "y2": self.btn_y2})
            self.buttons.append(s)

        # Group 3: Color Swatches
        x_start = 615
        spacing = 50
        for i, (name, color_val) in enumerate(self.colors_map.items()):
            x_center = x_start + i * spacing
            # For shapes, we define bounding boxes. Circular buttons are approximated by bounding squares.
            self.buttons.append({
                "id": f"color_{name.lower()}",
                "name": name,
                "type": "color",
                "value": color_val,
                "x1": x_center - 20,
                "y1": self.btn_y1 + 5,
                "x2": x_center + 20,
                "y2": self.btn_y2 - 5
            })

        # Group 4: Actions (Clear, Save)
        actions = [
            {"id": "clear", "name": "Clear", "type": "action", "value": "clear"},
            {"id": "save", "name": "Save", "type": "action", "value": "save"}
        ]
        x_start = 980
        spacing = 75
        for i, act in enumerate(actions):
            x1 = x_start + i * spacing
            x2 = x1 + 65
            act.update({"x1": x1, "y1": self.btn_y1, "x2": x2, "y2": self.btn_y2})
            self.buttons.append(act)

    def check_collision(self, x, y):
        """Checks if cursor point (x, y) is inside any button boundary."""
        # Check toolbar area first to optimize
        if y > self.height:
            return None
        
        for btn in self.buttons:
            if btn["x1"] <= x <= btn["x2"] and btn["y1"] <= y <= btn["y2"]:
                return btn
        return None

    def update_hover(self, cursor_pt, is_pinched=False):
        """
        Updates the hover dwell state based on current cursor coordinate.
        :param cursor_pt: Smooth cursor coordinate (x, y).
        :param is_pinched: If True, indicates user performed click gesture.
        :return: Tuple (clicked_button, hover_progress) where progress is 0.0 to 1.0.
        """
        if cursor_pt is None:
            self.hover_btn_id = None
            self.hover_count = 0
            return None, 0.0

        cx, cy = cursor_pt
        collided_btn = self.check_collision(cx, cy)

        # If a pinch gesture is detected, immediately trigger the hover button as clicked
        if is_pinched and collided_btn is not None:
            self.hover_btn_id = None
            self.hover_count = 0
            self._activate_button(collided_btn)
            return collided_btn, 1.0

        if collided_btn is None:
            self.hover_btn_id = None
            self.hover_count = 0
            return None, 0.0

        # Hover logic: if same button as previous frame, increment dwell count
        if collided_btn["id"] == self.hover_btn_id:
            self.hover_count += 1
            progress = min(1.0, self.hover_count / self.dwell_threshold)
            
            if self.hover_count >= self.dwell_threshold:
                # Trigger click event
                self._activate_button(collided_btn)
                self.hover_btn_id = None
                self.hover_count = 0
                return collided_btn, 1.0
            return None, progress
        else:
            # Switched to a new button
            self.hover_btn_id = collided_btn["id"]
            self.hover_count = 1
            return None, 1.0 / self.dwell_threshold

    def _activate_button(self, btn):
        """Executes the action corresponding to the button type."""
        btn_type = btn["type"]
        val = btn["value"]
        
        if btn_type == "tool":
            self.active_tool = val
        elif btn_type == "color":
            self.active_color = val
            # Auto-switch to pen/shape if color is selected while eraser is active
            if self.active_tool == "eraser":
                self.active_tool = "pen"
        elif btn_type == "size":
            self.active_size = val

    def draw_ui(self, img, cursor_pt, hover_progress):
        """
        Draws the toolbar layout, button labels, hover counts, and status indicators onto the frame.
        """
        # 1. Draw Toolbar background banner (semi-transparent dark ribbon)
        overlay = img.copy()
        cv2.rectangle(overlay, (0, 0), (self.width, self.height), (35, 35, 35), cv2.FILLED)
        cv2.line(overlay, (0, self.height), (self.width, self.height), (120, 120, 120), 2)
        
        # Apply semi-transparency for a modern aesthetic
        alpha = 0.90
        cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)

        # 2. Draw all buttons
        for btn in self.buttons:
            btn_id = btn["id"]
            x1, y1, x2, y2 = btn["x1"], btn["y1"], btn["x2"], btn["y2"]
            name = btn["name"]
            btn_type = btn["type"]
            val = btn["value"]
            
            # Determine selection status to colorize borders
            is_active = False
            if btn_type == "tool" and self.active_tool == val:
                is_active = True
            elif btn_type == "size" and self.active_size == val:
                is_active = True
            elif btn_type == "color" and np.array_equal(self.active_color, val) and self.active_tool != "eraser":
                is_active = True

            # Draw buttons based on type
            if btn_type == "color":
                # Draw circular color swatches
                cx_c = (x1 + x2) // 2
                cy_c = (y1 + y2) // 2
                radius = 18
                # Highlight active color swatch
                if is_active:
                    cv2.circle(img, (cx_c, cy_c), radius + 4, (200, 200, 200), 2)
                cv2.circle(img, (cx_c, cy_c), radius, val, cv2.FILLED)
                # Outer border for white swatch to make it visible
                if name == "White":
                    cv2.circle(img, (cx_c, cy_c), radius, (150, 150, 150), 1)
            else:
                # Draw rounded rectangle tool/action buttons
                bg_color = (60, 60, 60)
                text_color = (240, 240, 240)
                
                if is_active:
                    bg_color = (0, 120, 240)  # Bright blue active state background
                    text_color = (255, 255, 255)
                elif btn_type == "action":
                    bg_color = (50, 80, 50) if btn_id == "save" else (80, 50, 50)
                
                cv2.rectangle(img, (x1, y1), (x2, y2), bg_color, cv2.FILLED)
                cv2.rectangle(img, (x1, y1), (x2, y2), (100, 100, 100), 1) # border
                
                # Text labels
                font_scale = 0.45
                font_thickness = 1
                (tw, th), _ = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
                tx = x1 + (x2 - x1 - tw) // 2
                ty = y1 + (y2 - y1 + th) // 2
                cv2.putText(img, name, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, text_color, font_thickness, cv2.LINE_AA)

        # 3. Draw active preview swatch (At the far right)
        swatch_x1 = 1145
        swatch_x2 = 1205
        cv2.rectangle(img, (swatch_x1, self.btn_y1), (swatch_x2, self.btn_y2), (50, 50, 50), cv2.FILLED)
        cv2.rectangle(img, (swatch_x1, self.btn_y1), (swatch_x2, self.btn_y2), (120, 120, 120), 1)
        
        # Dynamic inner color swatch (shows active color or eraser text)
        pad = 6
        if self.active_tool == "eraser":
            # Show gray and the word "ERASE"
            cv2.rectangle(img, (swatch_x1 + pad, self.btn_y1 + pad), (swatch_x2 - pad, self.btn_y2 - pad), (128, 128, 128), cv2.FILLED)
            cv2.putText(img, "ERASE", (swatch_x1 + 10, 43), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1, cv2.LINE_AA)
        else:
            # Fill with active color
            cv2.rectangle(img, (swatch_x1 + pad, self.btn_y1 + pad), (swatch_x2 - pad, self.btn_y2 - pad), self.active_color, cv2.FILLED)
            # Show dot in center displaying active thickness
            center_x = (swatch_x1 + swatch_x2) // 2
            center_y = (self.btn_y1 + self.btn_y2) // 2
            dot_color = (0, 0, 0) if np.mean(self.active_color) > 128 else (255, 255, 255)
            cv2.circle(img, (center_x, center_y), max(2, self.active_size // 2), dot_color, cv2.FILLED)

        # Label for swatch
        cv2.putText(img, "Swatch", (swatch_x1 + 3, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (180, 180, 180), 1, cv2.LINE_AA)

        # 4. Draw Dwell Click Loader (if currently hovering)
        if self.hover_btn_id is not None and cursor_pt is not None and hover_progress > 0.0:
            cx, cy = cursor_pt
            # Draw a loading circle arc around the cursor
            radius = 24
            angle = int(360 * hover_progress)
            
            # Subdued gray background circle
            cv2.circle(img, (cx, cy), radius, (100, 100, 100), 2, cv2.LINE_AA)
            # Green progress arc
            cv2.ellipse(img, (cx, cy), (radius, radius), -90, 0, angle, (0, 255, 0), 3, cv2.LINE_AA)
