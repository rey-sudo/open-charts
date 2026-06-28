import { _clampView } from "../../timeScale/_clampView";
import { _resetViewport } from "../../timeScale/_resetViewport";
import type { ChartEngine } from "../../core/chartEngine";

/**
 * Utils API exposed by the chart engine.
 */
export class ChartTimeScale {
  constructor(private readonly engine: ChartEngine) {}

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
   */
  public clampView(): void {
    _clampView(this.engine);
  }

  /**
   * Resets the viewport to the default position.
   *
   * This function is typically called after loading a new dataset or
   * whenever the chart should display the most recent bars.
   *
   * The viewport is positioned at the end of the available data, then
   * clamped to ensure it satisfies the current chart constraints.
   */
  public resetViewport(): void {
    _resetViewport(this.engine);
  }
}
