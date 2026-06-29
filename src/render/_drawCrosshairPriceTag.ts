import type { ChartEngine } from "../core/chartEngine";

/**
 * Draws the crosshair price tag.
 *
 * Unlike the last-price tags, this tag is rendered on the overlay
 * layer so it is automatically cleared every frame.
 *
 * @param engine Chart engine instance.
 * @param price Crosshair price.
 * @param color Tag background color.
 * @param priceMin Lowest visible price.
 * @param priceMax Highest visible price.
 */
export function _drawCrosshairPriceTag(
  engine: ChartEngine,
  price: number,
  color: string,
  priceMin: number,
  priceMax: number,
): void {
  const ctx = engine.ctxOMain;
  const pane = engine.panes.main;

  const y = engine.utils.yOf(price, pane, priceMin, priceMax);

  const W = 60;
  const H = 16;
  const X = engine.chartW - W;

  ctx.save();

  ctx.fillStyle = color;
  ctx.fillRect(X, y - H / 2, W, H);

  ctx.fillStyle = engine.options.colors.text;
  ctx.font = `${engine.options.fontSizeNormal} ${engine.options.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(price.toFixed(2), X + W / 2, y);

  ctx.restore();
}