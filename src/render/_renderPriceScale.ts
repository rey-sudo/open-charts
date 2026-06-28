import type { ChartEngine } from "../core/chartEngine";
import { PRICE_SCALE_W } from "../core/config";
import { _nicePriceSteps } from "../utils/_nicePriceSteps";

export function _renderPriceScale(
  engine: ChartEngine,
  priceMin: number,
  priceMax: number,
) {
  const ctx = engine.ctxPScale;
  const W = PRICE_SCALE_W;
  const H = engine.panes.scale.h;
  const p = engine.panes.main; // yOf necesita el pane main para el height

  ctx.clearRect(0, 0, W, H);

  // Fondo
  ctx.fillStyle = engine.options.colors.bg2;
  ctx.fillRect(0, 0, W, H);

  // Línea separadora izquierda
  ctx.strokeStyle = engine.options.colors.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(0.5, H);
  ctx.stroke();

  // Labels en cada grid step
  const steps = _nicePriceSteps(priceMin, priceMax, 6);
  ctx.fillStyle = engine.options.colors.textDim;
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "right";
  steps.forEach((price) => {
    const y = Math.round(engine.utils.yOf(price, p, priceMin, priceMax)) + 0.5;
    ctx.fillText(price.toFixed(2), W - 8, y + 3.5);
  });

  // Tag del último close — estático, no es el crosshair
  if (!engine.hasData) return;
  const last: any = engine.data[engine.data.length - 1];

  const y = engine.utils.yOf(last.close, p, priceMin, priceMax);
  const bull = last.close >= last.open;
  ctx.fillStyle = bull
    ? engine.options.colors.bull
    : engine.options.colors.bear;
  ctx.fillRect(1, y - 8, W - 2, 16);
  ctx.fillStyle = "#050810";
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(last.close.toFixed(2), W / 2, y + 3.5);
}
