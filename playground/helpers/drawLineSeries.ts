import type { ChartEngine } from "../../src/core/chartEngine";
import type { MainPane } from "../../src/core/types";

export function drawLineSeries<T>(
  ctx: CanvasRenderingContext2D,
  engine: ChartEngine,
  pane: MainPane,
  values: readonly T[],
  accessor: (value: T) => number,
  color: string,
  lineWidth: number,
  priceMin: number,
  priceMax: number,
): void {


  const start = Math.max(engine.viewStart, 0);
  const end = Math.min(engine.viewEnd, values.length);

  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  let started = false;

  for (let i = start; i < end; i++) {
    const value = accessor(values[i]);

    if (!Number.isFinite(value)) {
      started = false;
      continue;
    }

    const x = Math.round(engine.utils.xOf(i)) + 0.5;
    const y = engine.utils.yOf(value, pane, priceMin, priceMax);

    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  ctx.restore();
}