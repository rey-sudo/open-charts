/**
 * Retrieves all chart DOM elements and initializes their
 * corresponding 2D rendering contexts.
 */
export function _grabCanvases(this: any) {
  const area = this.area;
  this.legendDiv = area.querySelector("#chart-legend");
  this.indicatorsDiv = area.querySelector("#chart-indicators");

  this.cMain = area.querySelector("#canvas-main");
  this.ctxMain = this.cMain.getContext("2d");
  this.cDrawings = area.querySelector("#canvas-drawings");
  this.ctxDrawings = this.cDrawings.getContext("2d");
  this.pScale = area.querySelector("#canvas-pricescale");
  this.ctxPScale = this.pScale.getContext("2d");
  this.oMain = area.querySelector("#canvas-overlay");
  this.ctxOMain = this.oMain.getContext("2d");
  this.cTime = area.querySelector("#canvas-time");
  this.ctxTime = this.cTime.getContext("2d");

  // Cachear el resto para no volver a tocar document.getElementById
  this.paneMainEl = area.querySelector("#pane-main");
  this.timeAxisEl = area.querySelector("#time-axis");
  this.scrollbarEl = area.querySelector("#scrollbar");
  this.scrollThumbEl = area.querySelector("#scrollthumb");
  this.statusFpsEl = area.querySelector("#status-fps");
  this.statusBarsEl = area.querySelector("#status-bars");
  this.statusZoomEl = area.querySelector("#status-zoom");
}
