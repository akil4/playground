// UIManager.js
export class UIManager {
  constructor() {
    this.activeTool = "pen";
    this.activeColor = "#ff0055";
    this.activeSize = 10;
    
    this.hoverProgress = 0;
    this.hoveredBtn = null;
    
    this.btnElements = Array.from(document.querySelectorAll('button'));
    this.progressEl = document.getElementById('hover-progress');
    this.statusEl = document.getElementById('gesture-status');

    this.setupClickListeners();
  }

  setupClickListeners() {
    // For normal mouse clicks (fallback/debugging)
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.setActiveTool(e.target.dataset.tool));
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.setActiveColor(e.target.dataset.color));
    });
  }

  setActiveTool(tool) {
    this.activeTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
    if(btn) btn.classList.add('active');
  }

  setActiveColor(color) {
    this.activeColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.color-btn[data-color="${color}"]`);
    if(btn) btn.classList.add('active');
  }

  updateStatus(gesture) {
    this.statusEl.textContent = `GESTURE: ${gesture}`;
  }

  // Check if cursor is over a button
  checkHover(x, y) {
    // Hide progress by default
    this.progressEl.style.display = 'none';
    
    if (x === null || y === null) {
      this.hoverProgress = 0;
      this.hoveredBtn = null;
      return null;
    }

    let foundBtn = null;
    
    for (let btn of this.btnElements) {
      const rect = btn.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        foundBtn = btn;
        break;
      }
    }

    if (foundBtn) {
      if (this.hoveredBtn === foundBtn) {
        this.hoverProgress += 5; // Dwell time speed
      } else {
        this.hoveredBtn = foundBtn;
        this.hoverProgress = 0;
      }

      // Show progress ring
      this.progressEl.style.display = 'block';
      this.progressEl.style.left = `${x}px`;
      this.progressEl.style.top = `${y}px`;
      
      // Simple rotation animation for progress
      this.progressEl.style.transform = `translate(-50%, -50%) rotate(${this.hoverProgress * 3.6}deg)`;

      if (this.hoverProgress >= 100) {
        this.triggerButton(foundBtn);
        this.hoverProgress = 0;
        return foundBtn;
      }
    } else {
      this.hoveredBtn = null;
      this.hoverProgress = 0;
    }
    
    return null;
  }

  triggerPinch(x, y) {
    if (x === null || y === null) return null;
    for (let btn of this.btnElements) {
      const rect = btn.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        this.triggerButton(btn);
        return btn;
      }
    }
    return null;
  }

  triggerButton(btn) {
    if (btn.classList.contains('tool-btn')) {
      this.setActiveTool(btn.dataset.tool);
    } else if (btn.classList.contains('color-btn')) {
      this.setActiveColor(btn.dataset.color);
    } else if (btn.id === 'btn-clear' || btn.id === 'btn-save') {
      // These are handled by main.js callbacks usually, but we can emit events or just click them
      btn.click(); 
    }
  }
}
