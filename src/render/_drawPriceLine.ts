import type { ChartEngine } from "../core/chartEngine";

/**
 * Draws the horizontal guide line associated with a price tag.
 *
 * @param engine Chart engine instance.
 * @param price Price represented by the line.
 * @param color Line color.
 * @param priceMin Lowest visible price.
 * @param priceMax Highest visible price.
 */
export function _drawPriceLine(
  engine: ChartEngine,
  price: number,
  color: string,
  priceMin: number,
  priceMax: number,
): void {
  const ctx = engine.ctxMain;
  const pane = engine.panes.main;

  // Convert the price into a screen Y coordinate.
  const y = Math.round(engine.utils.yOf(price, pane, priceMin, priceMax)) + 0.5;

  ctx.save();

  /**
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(engine.chartW, y);
  ctx.stroke();

  ctx.restore();
   */

  ctx.save();

  ctx.fillStyle = color;

  for (let x = 0; x < engine.chartW; x += 6) {
    ctx.fillRect(x, y, 2, 1);
  }

  ctx.restore();
}
