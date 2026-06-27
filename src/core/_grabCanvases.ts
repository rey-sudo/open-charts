import type { ChartEngine } from "../core/chartEngine";

/**
 * Retrieves all chart DOM elements and initializes their
 * corresponding 2D rendering contexts.
 */
export function _grabCanvases(engine: ChartEngine): void {
  const a = engine.area;

  // CANVAS
  engine.cMain = a.querySelector("#canvas-main") as HTMLCanvasElement;
  engine.cDrawings = a.querySelector("#canvas-drawings") as HTMLCanvasElement;
  engine.pScale = a.querySelector("#canvas-pricescale") as HTMLCanvasElement;
  engine.oMain = a.querySelector("#canvas-overlay") as HTMLCanvasElement;
  engine.cTime = a.querySelector("#canvas-time") as HTMLCanvasElement;

  // CONTEXTS
  engine.ctxMain = engine.cMain.getContext("2d") as CanvasRenderingContext2D;
  engine.ctxDrawings = engine.cDrawings.getContext(
    "2d",
  ) as CanvasRenderingContext2D;
  engine.ctxPScale = engine.pScale.getContext("2d") as CanvasRenderingContext2D;
  engine.ctxOMain = engine.oMain.getContext("2d") as CanvasRenderingContext2D;
  engine.ctxTime = engine.cTime.getContext("2d") as CanvasRenderingContext2D;

  // CONTAINERS
  engine.legendDiv = a.querySelector("#chart-legend") as HTMLElement;
  engine.indicatorsDiv = a.querySelector("#chart-indicators") as HTMLElement;
  engine.paneMainEl = a.querySelector("#pane-main") as HTMLElement;
  engine.timeAxisEl = a.querySelector("#time-axis") as HTMLElement;
  engine.scrollbarEl = a.querySelector("#scrollbar") as HTMLElement;
  engine.scrollThumbEl = a.querySelector("#scrollthumb") as HTMLElement;
  engine.statusBarsEl = a.querySelector("#status-bars") as HTMLElement;
  engine.statusZoomEl = a.querySelector("#status-zoom") as HTMLElement;
}
