import type { ChartEngine } from "../core/chartEngine";
import { PRICE_SCALE_W } from "../core/config";
import { _formatPrice } from "../utils/_formatPrice";
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
    const text = _formatPrice(price);

    const y =
      Math.round(engine.utils.yOf(price, pane, priceMin, priceMax)) + 0.5;

    ctx.fillText(text, engine.options.priceScaleWidth - 8, y + 3.5);
  });

  // Draw the last price tag for every enabled series.
  engine._series.forEach(({ def, enabled, data, values }) => {
    if (!enabled || !def.priceTags) {
      return;
    }

    for (const tag of def.priceTags(data, values)) {
      _drawPriceLine(engine, tag.value, tag.color, priceMin, priceMax);

      _drawPriceTag(engine, ctx, tag.value, tag.color, priceMin, priceMax);
    }
  });
}
