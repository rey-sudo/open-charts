import type { ChartEngine } from "../../core/chartEngine";
import type { ChartSeries, SeriesDefinition } from "../../core/types/engine";
import { addSeries } from "../addSeries";

/**
 * Public API exposed by the chart engine.
 */
export class ChartEngineApi {
  constructor(private readonly engine: ChartEngine) {}

  /**
   * Adds a new series to the chart.
   *
   * @param def Series definition.
   * @returns The created series.
   */
  public addSeries(def: SeriesDefinition): ChartSeries {
    return addSeries(this.engine, def);
  }


}
