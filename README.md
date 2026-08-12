# The Coordinate 🌐

*Visualize the Paths of your Codebase.*

**The Coordinate** (formerly GitLog Canvas) is a premium, DevTools-grade interactive web application designed to instantly parse, visualize, and inspect raw `git log` and `git diff` text. 

Built with an exclusive **"Cyber Telemetry"** dark-mode palette, it combines the aesthetics of high-performance racing telemetry dashboards with the awe-inspiring lore of Attack on Titan's Coordinate—where all paths and branches converge into a single glowing network.

---

## ✨ Features

- **Smart Git Parsing**: Just paste your text. The app automatically detects if you pasted a Git diff or a Git log. It gracefully handles standard linear logs or constructs complex branching trees if parent data is provided.
- **The Paths (Commit Graph)**: Powered by `react-force-graph-2d`, your commits are rendered as a physics-based, interactive, Obsidian-style network graph. Commits glow dynamically based on their type.
- **Conventional Changelog Generator**: Automatically parses your commit messages (`feat:`, `fix:`, `refactor:`) and groups them into a beautiful markdown changelog. Features a 1-click "Copy Markdown" button for instant use in GitHub Releases.
- **Interactive Diff Viewer**: A highly polished, split-pane file explorer. The collapsible sidebar displays all changed files with color-coded badges, while the main window uses `PrismJS` to deliver perfect syntax highlighting and line-by-line addition/deletion tracking.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone or download this repository.
2. Navigate to the project directory:
   ```bash
   cd git-visualizer
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`.

## 🛠️ How to Use

### Visualizing the Commit Tree
To get the absolute best experience and unlock the branching graph, use this specific Git command in your repository terminal and paste the output into the app:
```bash
git log --pretty=format:"%h|%p|%an|%ad|%s"
```

### Visualizing Diffs
Simply run `git diff` or `git diff <branch_a> <branch_b>` in your terminal and paste the raw unified diff text directly into the application. The app will instantly slice it into an interactive file tree.

## 💻 Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v3 (Custom Cyber Telemetry Theme)
- **Graphing Engine**: `react-force-graph-2d`
- **Syntax Highlighting**: PrismJS
- **Icons**: Lucide React
