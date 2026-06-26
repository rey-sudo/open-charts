import { PRICE_SCALE_W } from "./config";
import { _updateScrollThumb } from "../ui/_updateScrollThumb";
import type { ChartEngine } from "./chartEngine";
import { _clampView } from "./_clampView";

/**
 * Resizes and reconfigures all chart canvases to match the current
 * layout dimensions and device pixel ratio (DPR).
 *
 * This method:
 * - Synchronizes canvas backing-store resolution with CSS dimensions.
 * - Applies HiDPI scaling for crisp rendering on Retina displays.
 * - Resets canvas transforms to prevent accumulated scaling.
 * - Updates pane geometry for the main chart, price scale, and time axis.
 * - Recalculates the available chart width.
 * - Marks rendering layers as dirty for a full redraw.
 * - Clamps the current viewport and updates the scroll thumb.
 *
 * Canvas layers:
 * - Main canvas: price series and indicators.
 * - Overlay canvas: crosshair, hover states, and interactive elements.
 * - Drawings canvas: user annotations and drawing tools.
 * - Time canvas: bottom time scale.
 * - Price scale canvas: right-side price axis.
 */
export function _resize(engine: ChartEngine) {
  const dpr: number = window.devicePixelRatio || 1;

  /**
   * Configures a canvas for HiDPI rendering to ensure sharp,
   * pixel-perfect graphics on high-density displays.
   *
   * @param {HTMLCanvasElement} canvas Target canvas element.
   * @param {HTMLElement} container Container used to determine dimensions.
   */
  const setCanvas = (canvas: HTMLCanvasElement, container: HTMLElement) => {
    // Get the container's current layout dimensions.
    const r: DOMRect = container.getBoundingClientRect();

    // Compute the physical canvas width / height using the current DPR.
    const w: number = Math.ceil(r.width * dpr);
    const h: number = Math.ceil(r.height * dpr);

    // Set the canvas backing-store width / height in physical pixels.
    canvas.width = w;
    canvas.height = h;

    // Preserve the intended visual width / height in CSS pixels.
    canvas.style.width = w / dpr + "px";
    canvas.style.height = h / dpr + "px";

    // Scale the rendering context to match DPR coordinates.
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  };

  // Main chart pane-main container.
  const pMain: HTMLElement = engine.paneMainEl;

  // Bottom time axis container.
  const tAxis: HTMLElement = engine.timeAxisEl;

  // Resize chart rendering layers.
  setCanvas(engine.cMain, pMain);

  // Reset and resize overlay layer.
  setCanvas(engine.oMain, pMain);

  // Resize drawings layer.
  setCanvas(engine.cDrawings, pMain);

  // Resize time-axis layer.
  setCanvas(engine.cTime, tAxis);

  // Read updated layout dimensions.
  const mainR: DOMRect = pMain.getBoundingClientRect();
  const timeR: DOMRect = tAxis.getBoundingClientRect();

  // Resize the fixed width / height price scale canvas.
  engine.pScale.width = Math.ceil(PRICE_SCALE_W * dpr);
  engine.pScale.height = Math.ceil(mainR.height * dpr);
  engine.pScale.style.width = Math.ceil(PRICE_SCALE_W * dpr) / dpr + "px";
  engine.pScale.style.height = Math.ceil(mainR.height * dpr) / dpr + "px";

  // Reset and apply DPR scaling to the price scale context.
  engine.ctxPScale.setTransform(1, 0, 0, 1, 0, 0);
  engine.ctxPScale.scale(dpr, dpr);

  /**
   * Main chart pane geometry and rendering references.
   */
  engine.panes.main = {
    x: mainR.left,
    y: mainR.top,
    w: mainR.width,
    h: mainR.height,
    canvas: engine.cMain,
    ctx: engine.ctxMain,
    oCtx: engine.ctxOMain,
  };

  /**
   * Price scale pane dimensions.
   */
  engine.panes.scale = { w: PRICE_SCALE_W, h: mainR.height };

  /**
   * Time axis pane geometry.
   */
  engine.panes.time = {
    x: timeR.left,
    y: timeR.top,
    w: timeR.width,
    h: timeR.height,
  };

  // Effective drawable chart width excluding the price scale.
  engine.chartW = mainR.width - PRICE_SCALE_W;

  // Request a complete redraw.
  engine.dirty = true;
  engine.overlayDirty = true;

  // Ensure viewport constraints remain valid.
  _clampView(engine);

  // Recalculate scrollbar thumb size and position.
  _updateScrollThumb(engine);
}
