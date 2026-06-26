import { _visiblePriceRange } from "../core/_visiblePriceRange";
import { _renderPriceScale } from "./_renderPriceScale";
import { _renderTimeAxis } from "./_renderTimeAxis";
import { _renderMain } from "./_renderMain";
import type { ChartEngine } from "../core/chartEngine";

export function _render(engine: ChartEngine) {
  if (!engine.data.length) return;
  const { lo, hi } = _visiblePriceRange.call(engine);
  _renderMain.call(engine, lo, hi);
  _renderPriceScale.call(engine, lo, hi);
  _renderTimeAxis.call(engine);
}
