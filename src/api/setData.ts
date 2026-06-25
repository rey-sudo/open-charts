import { _recomputeSeries } from "../core/_recomputeSeries";
import { _updateScrollThumb } from "../ui/_updateScrollThumb";
import { _updateStatusBar } from "../ui/_updateStatusBar";
import type { ChartEngine } from "../core/chartEngine";

/**
 * Computes the chart time interval from a TIMESERIES dataset.
 *
 * The function inspects up to the first 10 consecutive timestamp
 * pairs and returns the smallest gap found. This allows the chart
 * to infer its base timeframe (e.g. 1m, 5m, 1h, 1d).
 *
 * If fewer than two bars are available, a daily interval
 * (86400 seconds) is returned as a safe fallback.
 *
 * @param data - Array of candle objects containing a `t` timestamp field.
 * @returns The detected interval in seconds.
 */
export function computeInterval(data: any): number {
  // A minimum of two bars is required to measure a time gap.
  if (data.length < 2) {
    // Fallback to a daily timeframe (86400 seconds).
    return 86400;
  }

  // Track the smallest timestamp gap encountered.
  let minGap = Infinity;

 // Inspect only the first few bars.
  const n = Math.min(data.length - 1, 10);

  // Measure consecutive timestamp differences.
  for (let i = 0; i < n; i++) {
    const gap = data[i + 1].t - data[i].t;

    // Ignore duplicate or invalid timestamps.
    if (gap > 0) {
      minGap = Math.min(minGap, gap);
    }
  }

  // Fallback if no valid gap was found.
  return Number.isFinite(minGap) ? minGap : 86400;
}

/**
 * Replaces the current dataset and resets the chart viewport.
 *
 * This method:
 * - Stores the new data.
 * - Detects the chart timeframe from the data.
 * - Recomputes all registered series.
 * - Moves the viewport to the most recent bars.
 * - Updates UI elements such as the scrollbar and status bar.
 * - Marks the chart as dirty so it will be redrawn on the next frame.
 *
 * @param this - Chart engine instance.
 * @param data - Array of TIMEFRAME objects.
 * @returns `true` when the dataset has been successfully applied.
 */
export function setData(this: ChartEngine, data: any): boolean {
  // Replace the current chart dataset.
  this.data = data;

  // Detect and cache the chart timeframe.
  this.interval = computeInterval(data);

  // Recalculate all indicator and derived series values.
  _recomputeSeries.call(this);

  // Calculate how many bars can fit in the visible chart width.
  const capacity = Math.floor(this.chartW / this.barWidth);

  // Position the viewport at the right edge of the dataset,
  // leaving some empty space after the last candle.
  this.viewEnd = data.length + this.rightPadBars;

  // Compute the first visible bar index.
  this.viewStart = Math.max(0, this.viewEnd - capacity);

  // Mark the chart for redraw.
  this.dirty = true;

  // Synchronize the scrollbar with the new viewport.
  _updateScrollThumb.call(this);

  // Refresh status bar information.
  _updateStatusBar.call(this);

  return true;
}
