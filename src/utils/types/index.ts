import type { ChartEngine } from "../../core/chartEngine";
import type { ChartPane } from "../../core/types";
import { _indexAtX } from "../_indexAtX";
import { _xOf } from "../_xOf";
import { _yOf } from "../_yOf";

/**
 * Utils API exposed by the chart engine.
 */
export class ChartEngineUtils {
  constructor(private readonly engine: ChartEngine) {}

  /**
   * Converts a data index into its corresponding X pixel coordinate
   * within the visible chart area.
   *
   * The returned coordinate represents the horizontal center of the
   * bar/candle, taking into account the current viewport position
   * (`viewStart`) and the active bar width (`barWidth`).
   *
   * @param i - Data index of the bar to convert.
   * @returns X coordinate in canvas pixels.
   */
  public xOf(i: number): number {
    return _xOf(this.engine, i);
  }

  /**
   * Converts a price value into its corresponding Y pixel coordinate
   * within a chart pane.
   *
   * The price is normalized between the visible minimum and maximum
   * price range, then mapped to the pane height while reserving
   * a small top and bottom padding (4% each) to prevent candles,
   * indicators, or drawings from touching the pane edges.
   *
   * @param price - Price value to convert.
   * @param pane - Target pane containing height information.
   * @param priceMin - Lowest visible price.
   * @param priceMax - Highest visible price.
   * @returns Y coordinate in canvas pixels.
   */
  public yOf(
    price: number,
    pane: ChartPane,
    priceMin: number,
    priceMax: number,
  ): number {
    return _yOf(price, pane, priceMin, priceMax);
  }

  /**
   * Converts a horizontal pixel position within the chart
   * into the corresponding data index based on current zoom
   * (bar width) and viewport offset.
   */
  public indexAtX(x: number): number {
    return _indexAtX(this.engine, x);
  }
}
