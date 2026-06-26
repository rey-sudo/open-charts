import { _visiblePriceRange } from "../core/_visiblePriceRange";
import type { ChartEngine } from "../core/chartEngine";

export function _renderDrawingModules(engine: ChartEngine) {
  const { lo, hi } = _visiblePriceRange.call(engine);
  const p = engine.panes.main;

  // Funciones de conversión frescas para este frame
  const xOf = (i: any) => engine.utils._xOf(i);
  const yOf = (price: any) => engine.utils._yOf(price, p, lo, hi);
  const indexAtX = (x: any) => engine.utils._indexAtX(x);
  const priceAtY = (y: any) =>
    lo + ((hi - lo) * (p.h * 0.96 - y)) / (p.h * 0.92);

  engine.ctxDrawings.clearRect(
    0,
    0,
    engine.cDrawings.width,
    engine.cDrawings.height,
  );

  engine._drawingModules.forEach((handle: any) => {
    if (!handle._render) return;
    engine.ctxDrawings.save();
    handle._render({ lo, hi, xOf, yOf, indexAtX, priceAtY });
    engine.ctxDrawings.restore();
  });
}
