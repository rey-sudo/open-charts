import type { ChartEngine } from "../core/chartEngine";

/**
 * Retrieves all chart DOM elements and initializes their
 * corresponding 2D rendering contexts.
 */
export function _grabCanvases(this: ChartEngine) {
  const area = this.area;
  
  this.legendDiv = area.querySelector("#chart-legend");
  this.indicatorsDiv = area.querySelector("#chart-indicators");

  this.cMain = area.querySelector("#canvas-main") as HTMLCanvasElement;
  this.ctxMain = this.cMain.getContext("2d") as CanvasRenderingContext2D;

  this.cDrawings = area.querySelector("#canvas-drawings") as HTMLCanvasElement;
  this.ctxDrawings = this.cDrawings.getContext("2d") as CanvasRenderingContext2D;

  this.pScale = area.querySelector("#canvas-pricescale")as HTMLCanvasElement;
  this.ctxPScale = this.pScale.getContext("2d") as CanvasRenderingContext2D;

  this.oMain = area.querySelector("#canvas-overlay")as HTMLCanvasElement;
  this.ctxOMain = this.oMain.getContext("2d") as CanvasRenderingContext2D;

  this.cTime = area.querySelector("#canvas-time")as HTMLCanvasElement;
  this.ctxTime = this.cTime.getContext("2d") as CanvasRenderingContext2D;


  this.paneMainEl = area.querySelector("#pane-main");
  this.timeAxisEl = area.querySelector("#time-axis");
  this.scrollbarEl = area.querySelector("#scrollbar");
  this.scrollThumbEl = area.querySelector("#scrollthumb");
  this.statusFpsEl = area.querySelector("#status-fps");
  this.statusBarsEl = area.querySelector("#status-bars");
  this.statusZoomEl = area.querySelector("#status-zoom");
}
