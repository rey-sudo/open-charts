import { _timeGridStep } from "./_timeGridStep";
import { _formatDate } from "../utils/time";
import { _isTimeGridLine } from "./_isTimeGridLine";
import type { ChartEngine } from "../core/chartEngine";

export function _renderTimeAxis(engine: ChartEngine) {
  const ctx = engine.ctxTime;
  const W = engine.panes.time.w;
  const H = engine.panes.time.h;
  const cw = engine.chartW;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = engine.options.colors.bg2;
  ctx.fillRect(0, 0, W, H);

  if (!engine.hasData) return;

  const data: any = engine.data;

  const step = _timeGridStep.call(engine);
  ctx.fillStyle = engine.options.colors.textDim;
  ctx.font = "9px Inter, sans-serif";
  ctx.textAlign = "center";

  for (
    let i = engine.viewStart;
    i < engine.viewEnd && i < engine.data.length;
    i++
  ) {
    if (!_isTimeGridLine.call(engine, i, step)) continue;
    const x = engine.utils.xOf(i);
    if (x < 16 || x > cw - 16) continue;
    ctx.fillText(_formatDate(data[i].time, step), x, 15);
  }
}
