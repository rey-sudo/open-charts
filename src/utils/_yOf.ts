import type { ChartPane } from "../core/types";

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
export function _yOf(
  price: number,
  pane: ChartPane,
  priceMin: number,
  priceMax: number,
): number {
  const range = priceMax - priceMin || 1;
  return pane.h - ((price - priceMin) / range) * pane.h * 0.92 - pane.h * 0.04;
}
