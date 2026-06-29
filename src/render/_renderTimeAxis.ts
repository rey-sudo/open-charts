import { _timeGridStep } from "./_timeGridStep";
import { _formatDate } from "../utils/time";
import { _isTimeGridLine } from "./_isTimeGridLine";
import type { ChartEngine } from "../core/chartEngine";

/**
 * Renders the bottom time axis.
 *
 * Grid labels are displayed only at selected time intervals in order
 * to avoid visual clutter. The label format adapts to the current
 * chart interval.
 *
 * @param engine Chart engine instance.
 */
export function _renderTimeAxis(engine: ChartEngine): void {
  const ctx = engine.ctxTime;
  const pane = engine.panes.time;

  // Clear the previous frame.
  ctx.clearRect(0, 0, pane.w, pane.h);

  // Paint the background.
  ctx.fillStyle = engine.options.colors.bg2;
  ctx.fillRect(0, 0, pane.w, pane.h);

  // Nothing to render if there is no data.
  if (!engine.hasData) return;

  const data: any[] = engine.data;
  const chartW = engine.chartW;

  // Determine the logical spacing between time labels.
  const step = _timeGridStep(engine);

  ctx.fillStyle = engine.options.colors.textDim;
  ctx.font = `${engine.options.fontSizeNormal} ${engine.options.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  console.log(step);

  console.log(engine.interval);

  console.log(data[0].time, data[1].time);

  for (let i = engine.viewStart; i < engine.viewEnd && i < data.length; i++) {
    // Skip bars that do not align with the current grid interval.
    if (!_isTimeGridLine(engine, i, step)) continue;

    const x = engine.utils.xOf(i);

    // Skip labels too close to the chart edges.
    if (x < 20 || x > chartW - 20) continue;

    // Draw the formatted time label.
    ctx.fillText(_formatDate(data[i].time, step), x, pane.h / 2);
  }
}
