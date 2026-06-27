import { _clampView } from "./_clampView";
import type { ChartEngine } from "./chartEngine";

/**
 * Resets the visible viewport to fit the current primary series.
 *
 * By default, the viewport is aligned to the most recent data.
 */
export function _resetViewport(engine: ChartEngine): void {
  const data = engine.data;

  if (!data?.length) {
    engine.viewStart = 0;
    engine.viewEnd = 0;
    return;
  }

  const capacity = Math.max(1, Math.floor(engine.chartW / engine.barWidth));

  engine.viewEnd = data.length + engine.rightPadBars;
  engine.viewStart = Math.max(0, engine.viewEnd - capacity);

  _clampView(engine);

  engine.dirty = true;
}
