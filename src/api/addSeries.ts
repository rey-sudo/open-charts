import type { ChartEngine } from "../core/chartEngine";
import type { ChartSeries, SeriesDefinition } from "../core/types/engine";
import { _updateLegend } from "../ui/_updateLegend";

/**
 * Registers a new indicator series.
 *
 * The indicator parameters are cloned to keep each series instance
 * independent from its original definition. If chart data is already
 * available, the indicator values are computed immediately.
 *
 * @param this Chart engine instance.
 * @param def Indicator definition.
 * @returns The chart instance for method chaining.
 */
export function addSeries(
  this: ChartEngine,
  def: SeriesDefinition,
): ChartEngine {
  // Clone the indicator parameter definitions.
  const params: Record<string, unknown> = {};

  if (def.params) {
    for (const [key, field] of Object.entries(def.params)) {
      params[key] = { ...field };
    }
  }

  // Create the series instance.
  const entry: ChartSeries = {
    def,
    values: [],
    enabled: true,
    params,
  };

  // Compute indicator values immediately if data is already loaded.
  if (this.data.length) {
    entry.values = def.compute(this);
  }

  // Register the series using its unique identifier.
  this._series.set(def.id, entry);

  // Refresh the legend UI.
  _updateLegend.call(this);

  // Enable method chaining.
  return this;
}