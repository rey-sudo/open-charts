import { _renderDrawingModules } from "../render/_renderDrawingModules";
import { _renderOverlay } from "../render/_renderOverlay";
import type { ChartEngine } from "./chartEngine";
import { _render } from "../render/_render";

export function _startLoop(engine: ChartEngine) {
  engine._running = true;

  const loop = (now: any) => {
    if (!engine._running) return;

    engine._rafId = requestAnimationFrame(loop);

    // FPS counter
    engine._fpsFrames++;
    if (now - engine._fpsTime >= 800) {
      engine.fps = Math.round(
        engine._fpsFrames / ((now - engine._fpsTime) / 1000),
      );
      engine._fpsFrames = 0;
      engine._fpsTime = now;
      engine.statusFpsEl.textContent = engine.fps + " FPS";
    }

    if (engine.dirty) {
      _render(engine);
      engine.dirty = false;
      engine.drawingsDirty = true;
      engine.overlayDirty = true; // overlay needs redraw after data repaint
    }

    if (engine.drawingsDirty) {
      _renderDrawingModules(engine);
      engine.drawingsDirty = false;
    }

    if (engine.overlayDirty) {
      _renderOverlay(engine);
      engine.overlayDirty = false;
    }
  };

  engine._rafId = requestAnimationFrame(loop);
}
