import type { ChartEngine } from "../core/chartEngine";
import { PRICE_SCALE_W } from "../core/config";
import { _nicePriceSteps } from "../utils/_nicePriceSteps";
import { _drawPriceLine } from "./_drawPriceLine";
import { _drawPriceTag } from "./_drawPriceTag";






export function _renderPriceScale(
  engine: ChartEngine,
  priceMin: number,
  priceMax: number,
): void {
  const ctx = engine.ctxPScale;
  const pane = engine.panes.main;
  const W = PRICE_SCALE_W;
  const H = engine.panes.scale.h;

  // Clear the previous frame.
  ctx.clearRect(0, 0, W, H);

  // Paint the background.
  ctx.fillStyle = engine.options.colors.bg;
  ctx.fillRect(0, 0, W, H);

  // Draw the left separator.
  ctx.strokeStyle = engine.options.colors.grid;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(0.5, H);
  ctx.stroke();

  // Draw price labels.
  ctx.fillStyle = engine.options.colors.textDim;
  ctx.font = `${engine.options.fontSizeNormal} ${engine.options.fontFamily}`;
  ctx.textAlign = "right";

  const steps = _nicePriceSteps(priceMin, priceMax, 6);

  steps.forEach((price) => {
    const y =
      Math.round(engine.utils.yOf(price, pane, priceMin, priceMax)) + 0.5;

    ctx.fillText(price.toFixed(2), W - 8, y + 3.5);
  });

  // Draw the last price tag for every enabled series.
  engine._series.forEach(({ def, enabled, data, values }) => {
    if (!enabled || !def.lastValue) return;

    const price = def.lastValue(data, values);

    if (price == null) return;

    const color =
      def.priceTagColor ??
      engine.options.colors.accent ??
      engine.options.colors.bull;

    // Draw the horizontal guide line.
    _drawPriceLine(engine, price, color, priceMin, priceMax);

    // Draw the price tag.
    _drawPriceTag(engine, ctx, price, color, priceMin, priceMax);
  });
}
