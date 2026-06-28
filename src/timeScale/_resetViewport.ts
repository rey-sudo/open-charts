import { _clampView } from "./_clampView";
import type { ChartEngine } from "./chartEngine";

/**
 * Resets the viewport to the default position.
 *
 * This function is typically called after loading a new dataset or
 * whenever the chart should display the most recent bars.
 *
 * The viewport is positioned at the end of the available data, then
 * clamped to ensure it satisfies the current chart constraints.
 *
 * @param engine Chart engine instance.
 */
export function _resetViewport(engine: ChartEngine): void {
  const data = engine.data;

  // Reset the viewport when no data is available.
  if (!data?.length) {
    engine.viewStart = 0;
    engine.viewEnd = 0;
    return;
  }

  // Position the viewport at the logical end of the dataset.
  engine.viewEnd = data.length + engine.rightPadBars;

  // Clamp the viewport to the current chart capacity.
  _clampView(engine);

  // Request a redraw.
  engine.dirty = true;
}