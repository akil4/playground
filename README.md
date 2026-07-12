# Hand-Gesture Virtual Paint Desktop App

This is a real-time Python desktop application that turns your webcam into a virtual drawing canvas controlled entirely by hand movements. Using OpenCV, MediaPipe, and NumPy, it maps specific finger postures to actions like selecting colors, drawing shapes, and saving compositions.

---

## Installation & Setup

### Prerequisites
- Python 3.8 or higher.
- A standard laptop or external USB webcam.

### Installation Steps
1. Navigate to the project directory:
   ```bash
   cd c:/Users/win11/Desktop/project/hand_Sketch
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python main.py
   ```

---

## Gestures & Controls

| Gesture | Finger Posture | Action | Description |
| :--- | :--- | :--- | :--- |
| **Draw / Move** | Index finger UP, all others closed | **Draw/Erase/Sketch** | Draws on the canvas at the index finger tip. Blocks drawing inside the toolbar header. |
| **Selection Mode** | Index + Middle fingers UP, others closed | **Hover Cursor** | Moves the cursor freely over the toolbar banner. Activates a selection if hovered over a button. |
| **Dwell Click** | (Selection Mode) Hover on button | **Click Confirmation** | If the cursor dwells inside a button boundary for **~0.4 seconds**, it automatically activates that button. |
| **Pinch Click** | Thumb + Index touching, others closed | **Instant Click** | Instantly clicks/activates the button currently under the cursor. |
| **Fist / Pause** | All fingers closed (clenched fist) | **Pause Interaction** | Temporarily hides the cursor and pauses all drawing/selection activities. |

### Keyboard Fallbacks
- **Press `q`**: Safely quits the application and releases the webcam.
- **Press `c`**: Instantly clears the canvas drawing layer.
- **Press `s`**: Saves your active sketch on a high-contrast white paper background inside the `exports/` folder.

---

## Shape Drawing State Machine
1. Switch to **Selection Mode** (Index + Middle UP) and hover over a shape tool (Line, Rect, or Circle).
2. Move your hand to the starting drawing area on the screen.
3. Transition to **Draw Mode** (fold your Middle finger). This sets the shape's start point.
4. Drag your index finger to stretch and adjust the shape (a dotted/thinner real-time preview is rendered).
5. Open your middle finger (Selection Mode) or close all fingers (Fist) to **commit** the shape permanently to the canvas.

---

## Troubleshooting Tips

### 1. Jittery Cursor / Tracking Loss
- **Lighting**: Ensure your face and hands are well-lit. Avoid bright, direct backlighting (like pointing the webcam at a bright window), which silhouettes the hand.
- **Background Interference**: Highly cluttered backgrounds or skin-toned objects behind you might confuse landmark detection. Use a neutral background if possible.
- **Camera Angle**: Keep your palm facing directly towards the camera. If your hand is at an extreme profile angle, MediaPipe may lose track of your fingers.

### 2. Dwell Click Triggers Too Quickly or Too Slowly
- You can adjust the click sensitivity by editing the `self.dwell_threshold` parameter in [ui_manager.py](file:///c:/Users/win11/Desktop/project/hand_Sketch/ui_manager.py). Lower values speed up clicks, while higher values require holding the cursor still for longer.

---

## Possible Improvements
- **Undo / Redo Stack**: Maintain an array of past canvas states to allow undoing/redoing strokes.
- **Multi-Hand Support**: Use one hand for selecting tools/adjusting brushes and the other hand strictly for drawing.
- **Adjustable Gesture Sensitivity**: Add dynamic thresholding parameters in a configuration GUI or ini file to support users with different hand shapes.
- **Custom Color Picker**: A color gradient circle showing a rich spectrum instead of fixed color swatches.
