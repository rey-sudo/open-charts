import type { ChartEngine } from "./chartEngine";

/**
 * Clamps the current viewport to a valid visible range.
 *
 * This function should be called whenever the viewport may become
 * invalid, such as after panning, zooming, resizing the chart,
 * or modifying the visible range.
 *
 * The function preserves the current viewport position whenever
 * possible while ensuring that:
 *
 * - `viewEnd` never moves outside the available data range.
 * - The visible capacity matches the current chart width and bar width.
 * - `viewStart` is recomputed from the clamped `viewEnd`.
 *
 * Unlike `_resetViewport()`, this function does not choose a new
 * viewport location. It only corrects an existing viewport so that
 * it remains valid.
 *
 * @param engine Chart engine instance.
 */
export function _clampView(engine: ChartEngine): void {
  // Exit early when no data is available.
  if (!engine.hasData) return;

  // Total logical bars, including the empty right-side padding.
  const total = engine.data.length + engine.rightPadBars;

  // Calculate how many bars fit within the current chart width.
  // Never allow less than one visible bar and never exceed the
  // total logical bar count.
  const capacity = Math.min(
    total,
    Math.max(1, Math.floor(engine.chartW / engine.barWidth)),
  );

  // Clamp the viewport end so it always stays within the valid
  // logical range while keeping enough room for the visible capacity.
  engine.viewEnd = Math.min(Math.max(engine.viewEnd, capacity), total);

  // Recalculate the viewport start from the clamped end index.
  engine.viewStart = Math.max(0, engine.viewEnd - capacity);
}
