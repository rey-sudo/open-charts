import type { ChartEngine } from "../core/chartEngine";
import { ChartSeries, type SeriesDefinition } from "../core/types";
import { _updateLegend } from "../ui/_updateLegend";

/**
 * Registers a new indicator series.
 *
 * The indicator parameters are cloned to keep each series instance
 * independent from its original definition. If chart data is already
 * available, the indicator values are computed immediately.
 *
 * @param engine Chart engine instance.
 * @param def Indicator definition.
 * @returns The chart instance for method chaining.
 */
export function addSeries(
  engine: ChartEngine,
  def: SeriesDefinition,
): ChartSeries {
  // Clone the indicator parameter definitions.
  const params: Record<string, unknown> = {};

  if (def.params) {
    for (const [key, field] of Object.entries(def.params)) {
      params[key] = { ...field };
    }
  }
  
  // Create the series instance.
  const entry: ChartSeries = new ChartSeries(engine, def, params);

  // Register the series using its unique identifier.
  engine._series.set(def.id, entry);

  // Refresh the legend UI.
  _updateLegend(engine);

  // Enable method chaining.
  return entry;
}
