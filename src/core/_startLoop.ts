import { _renderDrawingModules } from "../render/_renderDrawingModules";
import { _renderOverlay } from "../render/_renderOverlay";
import type { ChartEngine } from "./chartEngine";
import { _render } from "../render/_render";

/**
 * Starts the chart render loop.
 *
 * The loop runs continuously using `requestAnimationFrame` and
 * redraws only the layers that have been marked as dirty.
 *
 * Rendering is split into independent passes:
 * - Main chart
 * - Drawings
 * - Overlay
 */
export function _startLoop(engine: ChartEngine) {
  // Enable the render loop.
  engine._running = true;

  const loop = () => {
    // Stop scheduling new frames once the engine is no longer running.
    if (!engine._running) return;

    // Schedule the next animation frame.
    engine._rafId = requestAnimationFrame(loop);

    // Redraw the main chart when its state has changed.
    if (engine.dirty) {
      _render(engine);

      engine.dirty = false;
      engine.drawingsDirty = true;
      engine.overlayDirty = true;
    }

    // Redraw the drawings layer if needed.
    if (engine.drawingsDirty) {
      _renderDrawingModules(engine);
      engine.drawingsDirty = false;
    }

    // Redraw the overlay layer if needed.
    if (engine.overlayDirty) {
      _renderOverlay(engine);
      engine.overlayDirty = false;
    }
  };

  engine._rafId = requestAnimationFrame(loop);
}
