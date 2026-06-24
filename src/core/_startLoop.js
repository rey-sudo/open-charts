import { _renderDrawingModules } from "../render/_renderDrawingModules";
import { _render } from "../render/_render";

export function _startLoop() {
  this._running = true;

  const loop = (now) => {
    if (!this._running) return;

    this._rafId = requestAnimationFrame(loop);

    // FPS counter
    this._fpsFrames++;
    if (now - this._fpsTime >= 800) {
      this.fps = Math.round(this._fpsFrames / ((now - this._fpsTime) / 1000));
      this._fpsFrames = 0;
      this._fpsTime = now;
      this.statusFpsEl.textContent = this.fps + " FPS";
    }

    if (this.dirty) {
      _render.call(this);
      this.dirty = false;
      this.drawingsDirty = true;
      this.overlayDirty = true; // overlay needs redraw after data repaint
    }

    if (this.drawingsDirty) {
      _renderDrawingModules.call(this);
      this.drawingsDirty = false;
    }

    if (this.overlayDirty) {
      this._renderOverlay();
      this.overlayDirty = false;
    }
  };

  this._rafId = requestAnimationFrame(loop);
}
