import type { ChartEngine } from "../core/chartEngine";
import { _drawGrid } from "./_drawGrid";

/**
 * Renders the main chart pane.
 *
 * The rendering order is:
 * 1. Background
 * 2. Grid
 * 3. Background indicator series (e.g. Bollinger Bands)
 * 4. Foreground indicator series (e.g. Moving Averages)
 *
 * @param engine Chart engine instance.
 * @param priceMin Lowest visible price.
 * @param priceMax Highest visible price.
 */
export function _renderMain(
  engine: ChartEngine,
  priceMin: number,
  priceMax: number,
) {
  const p = engine.panes.main;
  const ctx = p.ctx;
  const W = p.w;
  const H = p.h;

  // Clear the previous frame.
  ctx.clearRect(0, 0, W, H);

  // Paint the chart background.
  ctx.fillStyle = engine.options.colors.bg;
  ctx.fillRect(0, 0, W, H);

  // Draw the chart grid.
  _drawGrid.call(engine, ctx, W, H, engine.chartW, priceMin, priceMax, p);

  // Render background indicator series (e.g. filled areas)
  // before the foreground elements.
  engine._series.forEach(({ def, data, values, enabled, params }) => {
    if (!enabled || def.layer !== "background") return;
    ctx.save();
    def.render(ctx, p, engine, data, values, priceMin, priceMax);
    ctx.restore();
  });

  // Render foreground indicator series (e.g. moving averages)
  // on top of the background layer.
  engine._series.forEach(({ def, data, values, enabled, params }) => {
    if (!enabled || def.layer === "background") return;
    ctx.save();
    def.render(ctx, p, engine, data, values, priceMin, priceMax);
    ctx.restore();
  });
}
