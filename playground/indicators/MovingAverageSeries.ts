import type { ChartEngine } from "../../src/core/chartEngine";
import type { MainPane, SeriesDefinition } from "../../src/core/types";

export const MovingAverageSeries: SeriesDefinition = {
  id: "ma",
  label: "MA 20",
  color: "#ffb830",
  layer: "foreground",
  priceTagColor: "#ffb830",
  params: {
    period: {
      type: "number",
      label: "Period",
      value: 20,
      min: 2,
      max: 200,
      step: 1,
    },
    color: { type: "color", label: "Color", value: "#ffb830" },
    width: {
      type: "number",
      label: "Width",
      value: 1.3,
      min: 0.5,
      max: 4,
      step: 0.5,
    },
    style: {
      type: "select",
      label: "Style",
      value: "solid",
      options: ["solid", "dashed", "dotted"],
    },
  },

  compute(data: any): any[] {
    const period = 20;
    const out: any[] = new Array(data?.length).fill(null);
    let sum = 0;
    for (let i = 0; i < data?.length; i++) {
      sum += data[i].close;
      if (i >= period) sum -= data[i - period].close;
      if (i >= period - 1) out[i] = sum / period;
    }
    return out;
  },

  render(
    ctx: CanvasRenderingContext2D,
    pane: MainPane,
    engine: ChartEngine,
    data: any,
    values: any[],
    priceMin: number,
    priceMax: number,
  ): void {
    ctx.strokeStyle = "#ffb830";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    let started = false;
    for (
      let i = engine.viewStart;
      i < engine.viewEnd && i < engine.data.length;
      i++
    ) {
      if (values[i] === null) continue;
      const x = engine.utils.xOf(i);
      const y = engine.utils.yOf(values[i], pane, priceMin, priceMax);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  },

  updateIncremental(values: any[], data: any[], isNewBar: boolean): void {
    const period = 20;
    const n = data.length - 1;
    if (isNewBar) values.push(null);
    if (n < period - 1) return;

    let sum = 0;
    for (let j = n - period + 1; j <= n; j++) sum += data[j].close;
    values[n] = sum / period;
  },

  tooltipRow(values: any[], i: number): any {
    if (values[i] === null) return null;
    return { label: "MA20", value: values[i].toFixed(2), color: "#ffb830" };
  },

  lastValue(data: any, values: any[]) {
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] != null) return values[i];
    }
    return null;
  },
};
