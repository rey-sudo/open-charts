import type { ChartEngine } from "../../src/core/chartEngine";
import type { MainPane } from "../../src/core/types";

export function drawHistogramSeries<T>(
  ctx: CanvasRenderingContext2D,
  pane: MainPane,
  engine: ChartEngine,
  values: readonly T[],
  valueMin: number,
  valueMax: number,
  getValue: (value: T, index: number) => number,
  getColor: (value: T, index: number) => string,
): void {
  const zeroY = Math.round(engine.utils.yOf(0, pane, valueMin, valueMax));

  const barWidth = Math.max(1, engine.barWidth - 1);

  for (let i = engine.viewStart; i < engine.viewEnd && i < values.length; i++) {
    const value = getValue(values[i], i);

    if (!Number.isFinite(value)) {
      continue;
    }

    const x = Math.round(engine.utils.xOf(i) - barWidth / 2);
    const y = Math.round(engine.utils.yOf(value, pane, valueMin, valueMax));

    const top = Math.min(y, zeroY);
    const height = Math.max(1, Math.abs(zeroY - y));

    ctx.fillStyle = getColor(values[i], i);
    ctx.fillRect(x, top, barWidth, height);
  }
}
