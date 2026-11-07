// CanvasManager.js
export class CanvasManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.resize(this.width, this.height);

    this.color = "#ff0055";
    this.brushSize = 10;
    this.eraserSize = 50;

    // For shape drawing (line, rect, circle)
    this.shapeStart = null;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    // Context state resets on resize, so we should save/restore image data if needed.
    // For now, assume window rarely resizes during drawing.
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawFreehand(prev, current, isEraser = false) {
    if (!prev || !current) return;
    
    this.ctx.beginPath();
    
    if (isEraser) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.eraserSize;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.brushSize;
    }
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(prev.x, prev.y);
    this.ctx.lineTo(current.x, current.y);
    this.ctx.stroke();
  }

  // Previews are drawn on a separate tracking canvas layer
  drawShapePreview(trackingCtx, start, current, tool) {
    if (!start || !current) return;
    
    trackingCtx.beginPath();
    trackingCtx.strokeStyle = this.color;
    trackingCtx.lineWidth = this.brushSize;
    trackingCtx.lineCap = 'round';

    if (tool === 'line') {
      trackingCtx.moveTo(start.x, start.y);
      trackingCtx.lineTo(current.x, current.y);
    } else if (tool === 'rect') {
      trackingCtx.rect(start.x, start.y, current.x - start.x, current.y - start.y);
    } else if (tool === 'circle') {
      const radius = Math.sqrt((current.x - start.x) ** 2 + (current.y - start.y) ** 2);
      trackingCtx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    }
    trackingCtx.stroke();
  }

  commitShape(start, current, tool) {
    if (!start || !current) return;
    this.ctx.globalCompositeOperation = 'source-over';
    this.drawShapePreview(this.ctx, start, current, tool);
  }

  save() {
    const dataURL = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `handSketch_${Date.now()}.png`;
    a.click();
  }
}
