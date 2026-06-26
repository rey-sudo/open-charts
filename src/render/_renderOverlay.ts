import { _clearOverlay } from "./_clearOverlay";
import { _renderTimeAxis } from "./_renderTimeAxis";
import { _visiblePriceRange } from "../core/_visiblePriceRange";
import { _drawPriceTag } from "./_drawPriceTag";
import { _drawTimeTag } from "./_drawTimeTag";
import { _updateOHLCVlegend } from "../ui/_updateOHLCVlegend";
import type { ChartEngine } from "../core/chartEngine";
import { _drawLivePulse } from "./_drawLivePulse";

export function _renderOverlay(engine: ChartEngine) {
  _clearOverlay.call(engine, engine.ctxOMain, engine.panes.main);

  _renderTimeAxis.call(engine);

  if (!engine.mouse.inside || !engine.data.length) {
    // Still draw the live price line even without crosshair
    if (engine._liveMode && engine.data.length) {
      const { lo, hi } = _visiblePriceRange.call(engine);
      _drawLivePulse.call(engine, engine.ctxOMain, engine.panes.main, lo, hi);
    }
    return;
  }

  const mx = engine.mouse.x;
  const my = engine.mouse.y;
  const pMain = engine.panes.main;

  // Determine which pane mouse is in
  const inMain = my >= pMain.y && my < pMain.y + pMain.h;

  // Bar index under cursor
  const localX = mx - pMain.x;
  const barIdx = Math.max(
    engine.viewStart,
    Math.min(engine.viewEnd - 1, engine.utils._indexAtX(localX)),
  );
  const d = engine.data[barIdx]; // may be undefined in right-padding zone

  const { lo, hi } = _visiblePriceRange.call(engine);

  // Live price dash — drawn unconditionally so it survives the !d early-exit below
  if (engine._liveMode) _drawLivePulse.call(engine, engine.ctxOMain, pMain, lo, hi);

  // Crosshair X (shared across panes)
  const snapX = Math.round(engine.utils._xOf(barIdx)) + 0.5;

  if (!d) {
    const ctx = engine.ctxOMain;

    ctx.save();

    ctx.strokeStyle = engine.options.colors.cross;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(snapX, 0);
    ctx.lineTo(snapX, pMain.h);
    ctx.stroke();

    ctx.restore();

    return;
  }

  // Main pane crosshair
  const ctx = engine.ctxOMain;
  ctx.save();
  ctx.strokeStyle = engine.options.colors.cross;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(snapX, 0);
  ctx.lineTo(snapX, pMain.h);
  ctx.stroke();

  if (inMain) {
    const localY = my - pMain.y;
    ctx.beginPath();
    ctx.moveTo(0, localY + 0.5);
    ctx.lineTo(engine.chartW, localY + 0.5);
    ctx.stroke();
    // Price label on scale
    const crossPrice =
      lo + ((hi - lo) * (pMain.h * 0.96 - localY)) / (pMain.h * 0.92);
    _drawPriceTag.call(
      engine,
      ctx,
      crossPrice,
      localY,
      pMain,
      engine.options.colors.cross,
      engine.options.colors.textDim,
    );
  }
  ctx.setLineDash([]);

  // Dot at close
  const dotY = engine.utils._yOf(d.c, pMain, lo, hi);
  ctx.beginPath();
  ctx.arc(snapX - 0.5, dotY, 3, 0, Math.PI * 2);
  ctx.fillStyle = engine.options.colors.crossPt;
  ctx.fill();
  ctx.restore();

  // Time label on axis
  _drawTimeTag.call(engine, barIdx);

  // OHLC header
  _updateOHLCVlegend.call(engine, d, barIdx);
}
