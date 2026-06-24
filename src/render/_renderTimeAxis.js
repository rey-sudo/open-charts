import { _timeGridStep } from "./_timeGridStep";
import { _formatDate } from "../utils/time";

export function _renderTimeAxis() {
  const ctx = this.ctxTime;
  const W = this.panes.time.w;
  const H = this.panes.time.h;
  const cw = this.chartW;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = this.options.colors.bg2;
  ctx.fillRect(0, 0, W, H);

  if (!this.data.length) return;
  const step = _timeGridStep.call(this);
  ctx.fillStyle = this.options.colors.textDim;
  ctx.font = "9px Inter, sans-serif";
  ctx.textAlign = "center";

  for (let i = this.viewStart; i < this.viewEnd && i < this.data.length; i++) {
    if (!this._isTimeGridLine(i, step)) continue;
    const x = this.utils._xOf(i);
    if (x < 16 || x > cw - 16) continue;
    ctx.fillText(_formatDate(this.data[i].t, step), x, 15);
  }
}
