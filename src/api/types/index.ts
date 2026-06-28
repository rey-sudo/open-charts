import type { ChartEngine } from "../../core/chartEngine";
import type { ChartSeries, SeriesDefinition } from "../../core/types";
import { addSeries } from "../addSeries";

/**
 * Public API exposed by the chart engine.
 */
export class ChartApi {
  constructor(private readonly engine: ChartEngine) {}

  /**
   * Registers a new indicator series.
   *
   * The indicator parameters are cloned to keep each series instance
   * independent from its original definition. If chart data is already
   * available, the indicator values are computed immediately.
   *
   * @param def Indicator definition.
   * @returns The chart instance for method chaining.
   */
  public addSeries(def: SeriesDefinition): ChartSeries {
    return addSeries(this.engine, def);
  }
}
