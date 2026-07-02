import { _visiblePriceRange } from "../core/_visiblePriceRange";
import { _drawCrosshair } from "./_drawCrosshair";
import { _drawCrosshairPoint } from "./_drawCrosshairPoint";
import { _drawCrosshairPriceTag } from "./_drawCrosshairPriceTag";
import { _drawLivePulse } from "./_drawLivePulse";
import { _drawTimeTag } from "./_drawTimeTag";
import type { ChartEngine } from "../core/chartEngine";
import { _renderTimeAxis } from "./_renderTimeAxis";
import { _updateIndicatorLegend } from "../ui/_updateIndicatorLegend";

/**
 * Renders the interactive overlay layer.
 *
 * The overlay is drawn on top of the main chart and contains
 * all transient UI elements such as:
 * - Live price pulse.
 * - Crosshair.
 * - Crosshair price tag.
 * - Selected bar marker.
 * - Time label.
 * - OHLC legend.
 */
export function _renderOverlay(engine: ChartEngine): void {
  const ctx = engine.ctxOMain;
  const pane = engine.panes.main;

  // Clear the previous overlay frame.
  ctx.clearRect(0, 0, pane.w, pane.h);

  const { lo, hi } = engine.core.visiblePriceRange();

  // Always render the live price pulse.
  if (engine._liveMode && engine.hasData) {
    _drawLivePulse(ctx, pane, lo, hi);
  }

  // Nothing else to render if the cursor is outside the chart.
  if (!engine.mouse.inside || !engine.hasData) {
    return;
  }

  const localX = engine.mouse.x - pane.x;
  const localY = engine.mouse.y - pane.y;

  const barIndex = Math.max(
    engine.viewStart,
    Math.min(engine.viewEnd - 1, engine.utils.indexAtX(localX)),
  );

  const bar: any = engine.data[barIndex];

  // Draw the crosshair.
  _drawCrosshair(engine, barIndex, localY, lo, hi);

  // Nothing else to draw if the cursor is over the right padding.
  if (!bar) {
    return;
  }

  // Highlight the selected bar.
  _drawCrosshairPoint(engine, bar.close, barIndex, lo, hi);

  // Draw the time label.
  _drawTimeTag(engine, barIndex);
  
  // Update indicator legend.
  _updateIndicatorLegend(engine, barIndex);
}
