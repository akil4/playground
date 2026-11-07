# Match-3 Game in C (Raylib)

A fully functional **Match-3 puzzle game** built in **C** using the [Raylib](https://www.raylib.com/) library.  
This project demonstrates grid-based game logic, match detection, tile swapping, and score management — all implemented from scratch without any game engine.

---

## Features

- Implemented entirely in C with Raylib for rendering.
- Tile swapping and match detection across rows and columns.
- Automatic clearing of matched tiles with score updates.
- Simple tile refill and chain reaction handling.
- Lightweight, dependency-free gameplay loop running at 60 FPS.

---

## Requirements

- **C compiler** (GCC, Clang, or MSVC)
- **Raylib library** version 4.5 or later

Install Raylib:

```bash
# Ubuntu / Debian
sudo apt install libraylib-dev

# macOS (Homebrew)
brew install raylib

# Windows (MSYS2)
pacman -S mingw-w64-x86_64-raylib
```

---

## Build Instructions

Clone this repository and build the project:

```bash
git clone https://github.com/<your-username>/match3-raylib.git
cd match3-raylib
gcc main.c -o match3 -lraylib -lm
./match3
```

**For Windows:**
```bash
gcc main.c -o match3.exe -lraylib -lopengl32 -lgdi32 -lwinmm
match3.exe
```

---

## Controls

| Action | Key |
|--------|-----|
| Select Tile | Left Mouse Click |
| Swap Adjacent Tile | Click and Point |
| Quit Game | ESC |

---

## Code Overview

- **main.c** – Core game logic and rendering loop.
- The grid is represented as a 2D integer array where each value corresponds to a tile color.
- When two adjacent tiles are swapped:
  - The program checks for matches horizontally and vertically.
  - Matched tiles are cleared, and new ones fall in from above.
  - The score updates based on the number of tiles matched.
- The process repeats automatically until no further matches are present.

---

## Future Improvements

- Power-up tiles (e.g., row/column clears, bombs)
- Time or move-based challenge modes
- Sound effects and background music
- Menu system and score leaderboard
- WebAssembly (Emscripten) build for browser play

---

## License

This project is licensed under the **MIT License**.  
You’re free to use, modify, and distribute it with attribution.

---

## Acknowledgments

- [Raylib](https://www.raylib.com/) – Simple and powerful library for C/C++ game development.
- Developed by **AKIL**, as a learning and demonstration project.

---
