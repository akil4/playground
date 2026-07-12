import cv2
import numpy as np
import math
import os
import time

class CanvasManager:
    """
    Manages the virtual painting layer (a NumPy BGR array).
    Handles freehand drawing, shape tools (with live previewing), 
    canvas clearing, and exporting the final drawing to a PNG.
    """
    def __init__(self, width=1280, height=720):
        self.width = width
        self.height = height
        
        # The virtual canvas is black. Non-black pixels represent drawings.
        # This allows us to use mask thresholding to overlay drawings onto the camera frame.
        self.canvas = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        
        # State settings
        self.color = (0, 0, 255)       # Default color: BGR Red
        self.brush_size = 8            # Default drawing size
        self.eraser_size = 40          # Default eraser size
        
        # Shape state machine variables
        self.shape_start_pt = None
        self.shape_current_pt = None

    def resize_canvas_if_needed(self, frame_shape):
        """Ensures the canvas matches the camera frame resolution dynamically."""
        fh, fw = frame_shape[:2]
        if fh != self.height or fw != self.width:
            self.width = fw
            self.height = fh
            # Resize existing canvas or create new one if size differs
            self.canvas = cv2.resize(self.canvas, (fw, fh), interpolation=cv2.INTER_NEAREST)

    def draw_freehand(self, prev_pt, curr_pt, is_eraser=False):
        """
        Draws a continuous line on the canvas.
        :param prev_pt: Previous (x, y) coordinates of the cursor.
        :param curr_pt: Current (x, y) coordinates of the cursor.
        :param is_eraser: If True, draws black on the canvas to act as an eraser.
        """
        if prev_pt is None or curr_pt is None:
            return
        
        draw_color = (0, 0, 0) if is_eraser else self.color
        thickness = self.eraser_size if is_eraser else self.brush_size
        
        # Draw a line from previous to current point for smoothness
        cv2.line(self.canvas, prev_pt, curr_pt, draw_color, thickness)

    def update_shape_preview(self, curr_pt):
        """
        Updates the active shape cursor point while drawing.
        :param curr_pt: Current cursor position (x, y).
        """
        if self.shape_start_pt is None:
            self.shape_start_pt = curr_pt
        self.shape_current_pt = curr_pt

    def commit_shape(self, tool_name):
        """
        Permanently draws the temporary shape onto the canvas.
        :param tool_name: The active shape tool ('line', 'rect', 'circle').
        """
        if self.shape_start_pt is not None and self.shape_current_pt is not None:
            pt1 = self.shape_start_pt
            pt2 = self.shape_current_pt
            
            if tool_name == "line":
                cv2.line(self.canvas, pt1, pt2, self.color, self.brush_size)
            elif tool_name == "rect":
                cv2.rectangle(self.canvas, pt1, pt2, self.color, self.brush_size)
            elif tool_name == "circle":
                # Compute radius as distance between start point (center) and current point
                radius = int(math.hypot(pt2[0] - pt1[0], pt2[1] - pt1[1]))
                cv2.circle(self.canvas, pt1, radius, self.color, self.brush_size)
                
        # Reset shape state variables
        self.shape_start_pt = None
        self.shape_current_pt = None

    def cancel_shape(self):
        """Resets the temporary shape points without writing them to the canvas."""
        self.shape_start_pt = None
        self.shape_current_pt = None

    def draw_shape_preview(self, img, tool_name):
        """
        Draws a temporary preview of the shape directly on the output image frame.
        :param img: Image frame to render the preview on.
        :param tool_name: Active tool name.
        """
        if self.shape_start_pt is not None and self.shape_current_pt is not None:
            pt1 = self.shape_start_pt
            pt2 = self.shape_current_pt
            
            # Preview uses a slightly transparent or dotted effect (simulated here as thinner lines)
            if tool_name == "line":
                cv2.line(img, pt1, pt2, self.color, max(1, self.brush_size - 2))
            elif tool_name == "rect":
                cv2.rectangle(img, pt1, pt2, self.color, max(1, self.brush_size - 2))
            elif tool_name == "circle":
                radius = int(math.hypot(pt2[0] - pt1[0], pt2[1] - pt1[1]))
                cv2.circle(img, pt1, radius, self.color, max(1, self.brush_size - 2))

    def clear_canvas(self):
        """Clears the drawing canvas."""
        self.canvas.fill(0)
        self.shape_start_pt = None
        self.shape_current_pt = None

    def save_canvas(self, output_dir="exports"):
        """
        Saves the virtual canvas onto a white background (like physical paper) as a PNG.
        :param output_dir: Directory where the PNG files will be stored.
        :return: Path to the saved file or None.
        """
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # Create a white background template
        white_bg = np.ones((self.height, self.width, 3), dtype=np.uint8) * 255
        
        # Composite our canvas drawing on top of the white background
        canvas_gray = cv2.cvtColor(self.canvas, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(canvas_gray, 1, 255, cv2.THRESH_BINARY)
        mask_inv = cv2.bitwise_not(mask)
        
        # Black out drawing areas on the white background, then add drawings
        bg_masked = cv2.bitwise_and(white_bg, white_bg, mask=mask_inv)
        fg_drawings = cv2.bitwise_and(self.canvas, self.canvas, mask=mask)
        saved_composition = cv2.add(bg_masked, fg_drawings)
        
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        filename = f"drawing_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        success = cv2.imwrite(filepath, saved_composition)
        if success:
            print(f"[CanvasManager] Drawing successfully saved to {filepath}")
            return filepath
        else:
            print("[CanvasManager] Failed to save drawing.")
            return None

    def overlay_canvas(self, camera_frame):
        """
        Overlays the drawing canvas onto the webcam camera frame.
        :param camera_frame: Raw camera frame BGR image.
        :return: Blended output frame.
        """
        # Convert drawing canvas to grayscale to build mask
        canvas_gray = cv2.cvtColor(self.canvas, cv2.COLOR_BGR2GRAY)
        
        # Create threshold binary mask: pixels > 1 become 255 (drawn areas)
        _, mask = cv2.threshold(canvas_gray, 1, 255, cv2.THRESH_BINARY)
        
        # Create inverse mask for background blacking
        mask_inv = cv2.bitwise_not(mask)
        
        # Black out drawing spots in the original camera frame
        frame_bg = cv2.bitwise_and(camera_frame, camera_frame, mask=mask_inv)
        
        # Get only drawing pixels from our canvas
        canvas_fg = cv2.bitwise_and(self.canvas, self.canvas, mask=mask)
        
        # Merge background and foreground layers
        output_frame = cv2.add(frame_bg, canvas_fg)
        return output_frame
