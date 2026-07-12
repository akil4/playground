import cv2
import numpy as np
import time

# Import modular components
from hand_tracker import HandTracker
from gesture_detector import (
    GestureDetector,
    GESTURE_DRAW,
    GESTURE_SELECT,
    GESTURE_FIST,
    GESTURE_PINCH,
    GESTURE_UNKNOWN
)
from canvas_manager import CanvasManager
from ui_manager import UIManager

def main():
    # 1. Initialize Webcam Capture
    # Standard resolution 1280x720 provides high tracking accuracy and a crisp canvas.
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    # Verify camera opened successfully
    if not cap.isOpened():
        print("[Error] Webcam could not be opened. Please check connections/permissions.")
        return

    # Read a sample frame to get camera resolution dynamically
    success, sample_frame = cap.read()
    if not success:
        print("[Error] Failed to read frame from webcam.")
        return
    
    frame_h, frame_w, _ = sample_frame.shape
    print(f"[Init] Camera Resolution: {frame_w}x{frame_h}")

    # 2. Instantiate helper modules
    # We use max_hands=1 since virtual paint is designed for single-hand drawing stability.
    tracker = HandTracker(max_hands=1, detection_confidence=0.75, tracking_confidence=0.6)
    detector = GestureDetector(ema_alpha=0.35) # 0.35 alpha balances responsiveness and low jitter
    canvas = CanvasManager(width=frame_w, height=frame_h)
    ui = UIManager(width=frame_w, height=110)

    # State variables
    prev_cursor = None
    prev_gesture = GESTURE_UNKNOWN
    progress = 0.0
    
    print("\n--- Hand-Gesture Virtual Paint Application Running ---")
    print("Keyboard Controls:")
    print("  'q' - Quit the application")
    print("  'c' - Clear the canvas drawing layer")
    print("  's' - Save the drawing composition as PNG")
    print("------------------------------------------------------\n")

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("[Warning] Missed video frame. Continuing...")
            continue

        # 3. Flip frame horizontally
        # Mirroring the image makes hand movements intuitive (move left, cursor goes left)
        frame = cv2.flip(frame, 1)
        
        # 4. Resize canvas if webcam resolution changes dynamically
        canvas.resize_canvas_if_needed(frame.shape)

        # 5. Detect hands & extract landmarks
        frame = tracker.find_hands(frame, draw=True)
        lm_list = tracker.get_landmarks(frame, hand_idx=0)

        current_gesture = GESTURE_UNKNOWN
        cursor = None

        if lm_list:
            # Tip of Index Finger (Landmark 8) is our cursor coordinate
            raw_cursor = (lm_list[8][1], lm_list[8][2])
            
            # Identify active gesture
            current_gesture, debug_info = detector.detect_gesture(lm_list)
            
            # Smooth coordinates using Exponential Moving Average
            cursor = detector.get_smoothed_cursor(raw_cursor)
        else:
            # Reset moving filters when hand is absent from screen
            detector.reset_smoothing()

        # 6. Apply Gesture-to-Action State Machine
        
        # TRANSITION LOGIC: If switching AWAY from Draw Mode, commit any shape that was in progress.
        if prev_gesture == GESTURE_DRAW and current_gesture != GESTURE_DRAW:
            if ui.active_tool in ["line", "rect", "circle"]:
                canvas.commit_shape(ui.active_tool)
                print(f"[App] Shape '{ui.active_tool.upper()}' committed to canvas.")

        # ACTION: Fist (Pause mode)
        if current_gesture == GESTURE_FIST:
            prev_cursor = None
            ui.update_hover(None) # Reset UI hover progress
            progress = 0.0
            
        # ACTION: Selection mode (Index + Middle extended)
        elif current_gesture == GESTURE_SELECT:
            prev_cursor = None
            # Update hover state for button clicks (Dwell click countdown)
            clicked_btn, progress = ui.update_hover(cursor, is_pinched=False)
            
            if clicked_btn:
                # Sync canvas setting changes
                canvas.color = ui.active_color
                canvas.brush_size = ui.active_size
                print(f"[UI] Activated: {clicked_btn['name']} ({clicked_btn['type']})")
                
                # Execute action buttons immediately
                if clicked_btn["id"] == "clear":
                    canvas.clear_canvas()
                    print("[Canvas] Cleared virtual canvas.")
                elif clicked_btn["id"] == "save":
                    filepath = canvas.save_canvas()
                    if filepath:
                        print(f"[Canvas] Composition saved to: {filepath}")
                        
        # ACTION: Pinch Mode (Instant click confirmation)
        elif current_gesture == GESTURE_PINCH:
            prev_cursor = None
            clicked_btn, progress = ui.update_hover(cursor, is_pinched=True)
            if clicked_btn:
                canvas.color = ui.active_color
                canvas.brush_size = ui.active_size
                print(f"[UI] Pinched Activation: {clicked_btn['name']}")
                
                if clicked_btn["id"] == "clear":
                    canvas.clear_canvas()
                elif clicked_btn["id"] == "save":
                    canvas.save_canvas()
                    
        # ACTION: Draw Mode (Index finger only extended)
        elif current_gesture == GESTURE_DRAW:
            ui.update_hover(None) # Clear UI hover if they switch to drawing
            progress = 0.0
            
            if cursor is not None:
                # Block drawing on top of the header toolbar banner
                if cursor[1] > ui.height:
                    if ui.active_tool == "pen":
                        canvas.draw_freehand(prev_cursor, cursor, is_eraser=False)
                    elif ui.active_tool == "eraser":
                        canvas.draw_freehand(prev_cursor, cursor, is_eraser=True)
                    elif ui.active_tool in ["line", "rect", "circle"]:
                        canvas.update_shape_preview(cursor)
                    
                    prev_cursor = cursor
                else:
                    # Cursor is hovering within the toolbar boundary while in draw mode: block drawing
                    prev_cursor = None
            else:
                prev_cursor = None
        else:
            # Gesture unknown or no hand detected
            prev_cursor = None
            ui.update_hover(None)
            progress = 0.0

        # Update previous gesture memory
        prev_gesture = current_gesture

        # 7. Rendering Layer Composites
        
        # Layer 1: Overlay virtual drawing canvas on the live webcam feed
        output_frame = canvas.overlay_canvas(frame)
        
        # Layer 2: Draw the temporary shape preview (only if currently dragging in DRAW mode)
        if current_gesture == GESTURE_DRAW and ui.active_tool in ["line", "rect", "circle"]:
            canvas.draw_shape_preview(output_frame, ui.active_tool)
            
        # Layer 3: Render the UI Ribbon toolbar on top of the composition
        ui.draw_ui(output_frame, cursor, progress)

        # Layer 4: Render Status bar at the bottom
        status_bar_h = 30
        cv2.rectangle(
            output_frame, 
            (0, frame_h - status_bar_h), 
            (frame_w, frame_h), 
            (30, 30, 30), 
            cv2.FILLED
        )
        status_text = (
            f"GESTURE: {current_gesture.upper()}  |  "
            f"TOOL: {ui.active_tool.upper()}  |  "
            f"COLOR: BGR{ui.active_color}  |  "
            f"BRUSH: {ui.active_size}px  |  "
            f"ERASER: {canvas.eraser_size}px"
        )
        cv2.putText(
            output_frame, 
            status_text, 
            (15, frame_h - 10), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.45, 
            (220, 220, 220), 
            1, 
            cv2.LINE_AA
        )

        # Layer 5: Draw visual Cursor feedback
        if cursor is not None:
            cx, cy = cursor
            if current_gesture == GESTURE_SELECT:
                # Green target crosshair cursor for Selection mode
                cv2.drawMarker(output_frame, (cx, cy), (0, 255, 0), cv2.MARKER_CROSS, 20, 2)
            elif current_gesture == GESTURE_DRAW:
                # Circle displaying current color & thickness
                c_color = (128, 128, 128) if ui.active_tool == "eraser" else ui.active_color
                c_size = canvas.eraser_size // 2 if ui.active_tool == "eraser" else max(4, ui.active_size)
                cv2.circle(output_frame, (cx, cy), c_size, c_color, 2)
                cv2.circle(output_frame, (cx, cy), 2, (255, 255, 255), cv2.FILLED)
            elif current_gesture == GESTURE_PINCH:
                # Magenta confirmation circle
                cv2.circle(output_frame, (cx, cy), 10, (255, 0, 255), 2)
                cv2.drawMarker(output_frame, (cx, cy), (255, 0, 255), cv2.MARKER_TILTED_CROSS, 12, 2)

        # 8. Keyboard Override / Fallbacks
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("[App] Quitting application.")
            break
        elif key == ord('c'):
            canvas.clear_canvas()
            print("[Keyboard] Canvas cleared.")
        elif key == ord('s'):
            filepath = canvas.save_canvas()
            if filepath:
                print(f"[Keyboard] Canvas saved: {filepath}")

        # Show Output Frame
        cv2.imshow("Hand-Gesture Virtual Paint", output_frame)

    # Release resources
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
