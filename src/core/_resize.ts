import { PRICE_SCALE_W } from "./config";
import type { ChartEngine } from "./chartEngine";
import { _updateScrollThumb } from "../timeScale/_updateScrollThumb";

/**
 * Configures a canvas for HiDPI rendering.
 *
 * The backing-store resolution is synchronized with the container
 * size while the CSS size remains unchanged, producing crisp
 * rendering on high-density displays.
 *
 * @param canvas Canvas to configure.
 * @param container Element that defines the canvas size.
 * @param dpr Current device pixel ratio.
 */
function _resizeCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  dpr: number,
): void {
  // Read the current container size.
  const rect = container.getBoundingClientRect();

  // Compute the backing-store size in physical pixels.
  const width = Math.ceil(rect.width * dpr);
  const height = Math.ceil(rect.height * dpr);

  // Resize the backing-store.
  canvas.width = width;
  canvas.height = height;

  // Preserve the visual size in CSS pixels.
  canvas.style.width = `${width / dpr}px`;
  canvas.style.height = `${height / dpr}px`;

  // Reset the transform before applying the DPR scale.
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

/**
 * Resizes the fixed-width price scale canvas.
 *
 * @param engine Chart engine.
 * @param height Price scale height in CSS pixels.
 * @param dpr Current device pixel ratio.
 */
function _resizePriceScale(
  engine: ChartEngine,
  height: number,
  dpr: number,
): void {
  const width = Math.ceil(PRICE_SCALE_W * dpr);
  const scaledHeight = Math.ceil(height * dpr);

  engine.pScale.width = width;
  engine.pScale.height = scaledHeight;

  engine.pScale.style.width = `${width / dpr}px`;
  engine.pScale.style.height = `${scaledHeight / dpr}px`;

  engine.ctxPScale.setTransform(1, 0, 0, 1, 0, 0);
  engine.ctxPScale.scale(dpr, dpr);
}

/**
 * Recomputes the chart layout after the container size changes.
 *
 * This function synchronizes every rendering surface with the current
 * layout, updates pane geometry, recalculates the drawable chart width,
 * validates the viewport, and schedules a full redraw.
 *
 * This function should be called whenever:
 *
 * - The window is resized.
 * - The chart container changes size.
 * - The device pixel ratio changes.
 *
 * @param engine Chart engine.
 */
export function _resize(engine: ChartEngine): void {
  // Current device pixel ratio.
  const dpr = window.devicePixelRatio || 1;

  // Resize every canvas that follows the main pane.
  _resizeCanvas(engine.cMain, engine.paneMainEl, dpr);
  _resizeCanvas(engine.oMain, engine.paneMainEl, dpr);
  _resizeCanvas(engine.cDrawings, engine.paneMainEl, dpr);

  // Resize the bottom time axis.
  _resizeCanvas(engine.cTime, engine.timeAxisEl, dpr);

  // Read the updated layout.
  const mainRect = engine.paneMainEl.getBoundingClientRect();
  const timeRect = engine.timeAxisEl.getBoundingClientRect();

  // Resize the fixed-width price scale.
  _resizePriceScale(engine, mainRect.height, dpr);

  // Update the main pane geometry.
  engine.panes.main = {
    x: mainRect.left,
    y: mainRect.top,
    w: mainRect.width,
    h: mainRect.height,
    canvas: engine.cMain,
    ctx: engine.ctxMain,
    oCtx: engine.ctxOMain,
  };

  // Update the price scale geometry.
  engine.panes.scale = {
    w: PRICE_SCALE_W,
    h: mainRect.height,
  };

  // Update the time axis geometry.
  engine.panes.time = {
    x: timeRect.left,
    y: timeRect.top,
    w: timeRect.width,
    h: timeRect.height,
  };

  // Recalculate the drawable chart width.
  engine.chartW = mainRect.width - PRICE_SCALE_W;

  // Keep the current viewport valid after the resize.
  engine.timeScale.clampView();

  // Synchronize the scrollbar with the new viewport.
  _updateScrollThumb(engine);

  // Schedule a full redraw.
  engine.dirty = true;
  engine.overlayDirty = true;
}
