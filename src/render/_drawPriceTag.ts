import type { ChartEngine } from "../core/chartEngine";
import { PRICE_SCALE_W } from "../core/config";

/**
 * Draws a price tag on the right-side price scale.
 *
 * @param engine Chart engine instance.
 * @param ctx Price scale rendering context.
 * @param price Price represented by the tag.
 * @param color Tag background color.
 * @param priceMin Lowest visible price.
 * @param priceMax Highest visible price.
 */
export function _drawPriceTag(
  engine: ChartEngine,
  ctx: CanvasRenderingContext2D,
  price: number,
  color: string,
  priceMin: number,
  priceMax: number,
): void {
  const pane = engine.panes.main;

  // Convert the price into a screen Y coordinate.
  const y = engine.utils.yOf(price, pane, priceMin, priceMax);

  // Draw the tag background.
  ctx.fillStyle = color;
  ctx.fillRect(1, y - 8, PRICE_SCALE_W - 2, 16);

  // Draw the price label.
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(price.toFixed(2), PRICE_SCALE_W / 2, y + 3.5);
}