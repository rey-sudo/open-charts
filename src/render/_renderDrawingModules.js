import { _visiblePriceRange } from "../core/_visiblePriceRange";

export function _renderDrawingModules() {
  const { lo, hi } = _visiblePriceRange.call(this);
  const p = this.panes.main;

  // Funciones de conversión frescas para este frame
  const xOf = (i) => this.utils._xOf(i);
  const yOf = (price) => this.utils._yOf(price, p, lo, hi);
  const indexAtX = (x) => this.utils._indexAtX(x);
  const priceAtY = (y) => lo + ((hi - lo) * (p.h * 0.96 - y)) / (p.h * 0.92);

  this.ctxDrawings.clearRect(0, 0, this.cDrawings.width, this.cDrawings.height);

  this._drawingModules.forEach((handle) => {
    if (!handle._render) return;
    this.ctxDrawings.save();
    handle._render({ lo, hi, xOf, yOf, indexAtX, priceAtY });
    this.ctxDrawings.restore();
  });
}
