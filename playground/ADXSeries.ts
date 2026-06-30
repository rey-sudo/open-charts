import { calculateADX } from "./ADX";
import type { ChartEngine } from "../src/core/chartEngine";
import type { MainPane, SeriesDefinition } from "../src/core/types";
import { drawLineSeries } from "./helpers/drawLineSeries";

export interface Candle {
  high: number;
  low: number;
  close: number;
}

export interface ADXValue {
  adx: number;
  plusDI: number;
  minusDI: number;
  reversal: boolean;
}

export const ADXSeries: SeriesDefinition<
  Candle,
  ADXValue,
  {
    diLength: number;
    adxLength: number;
    keyLevel: number;
  },
  string
> = {
  id: "adx",

  label: "ADX",

  color: "#6CFF4C",

  layer: "foreground",

  params: {
    diLength: 14,
    adxLength: 14,
    keyLevel: 23,
  },

  compute(data) {
    const high = data.map((d) => d.high);
    const low = data.map((d) => d.low);
    const close = data.map((d) => d.close);

    const result = calculateADX(
      high,
      low,
      close,
      this.params.diLength,
      this.params.adxLength,
      this.params.keyLevel,
    );

    console.log(result);

    return result.adx.map((adx, i) => ({
      adx,
      plusDI: result.plusDI[i],
      minusDI: result.minusDI[i],
      reversal: result.reversal[i],
    }));
  },

  updateIncremental(values, data) {
    // versión simple
    // vuelve a calcular toda la serie
    values.splice(0, values.length, ...this.compute(data));
  },

  render(ctx, pane: MainPane, engine, data, values, priceMin, priceMax): void {
    if (values.length < 2) return;

    // ADX
    drawLineSeries(
      ctx,
      engine,
      pane,
      values,
      (v) => v.adx,
      "#ffffff",
      2,
      priceMin,
      priceMax,
    );

    // +DI
    drawLineSeries(
      ctx,
      engine,
      pane,
      values,
      (v) => v.plusDI,
      "#2962FF",
      2,
      priceMin,
      priceMax,
    );

    // -DI
    drawLineSeries(
      ctx,
      engine,
      pane,
      values,
      (v) => v.minusDI,
      "#F23645",
      2,
      priceMin,
      priceMax,
    );

    // Reversal markers
    ctx.save();
    ctx.fillStyle = "#0096ff";

    const start = Math.max(engine.viewStart, 0);
    const end = Math.min(engine.viewEnd, values.length);

    for (let i = start; i < end; i++) {
      const v = values[i];

      if (!v.reversal || !Number.isFinite(v.adx)) {
        continue;
      }

      const x = Math.round(engine.utils.xOf(i)) + 0.5;
      const y = engine.utils.yOf(v.adx, pane, priceMin, priceMax);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Key level
    const y =
      Math.round(
        engine.utils.yOf(this.params.keyLevel, pane, priceMin, priceMax),
      ) + 0.5;

    ctx.save();

    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(engine.chartW, y);
    ctx.stroke();

    ctx.restore();
  },

  tooltipRow(values, index) {
    const v = values[index];

    if (!v) return null;

    return `ADX ${v.adx.toFixed(2)}
+DI ${v.plusDI.toFixed(2)}
-DI ${v.minusDI.toFixed(2)}`;
  },

  lastValue(data, values) {
    if (!values.length) return null;

    return values.at(-1)!.adx;
  },

  priceTagColor: "#6CFF4C",

  valueRange(data, values, start, end) {
    let lo = Infinity;
    let hi = -Infinity;

    for (let i = start; i < end; i++) {
      const v = values[i];

      if (!v) {
        continue;
      }

      if (Number.isFinite(v.adx)) {
        lo = Math.min(lo, v.adx);
        hi = Math.max(hi, v.adx);
      }

      if (Number.isFinite(v.plusDI)) {
        lo = Math.min(lo, v.plusDI);
        hi = Math.max(hi, v.plusDI);
      }

      if (Number.isFinite(v.minusDI)) {
        lo = Math.min(lo, v.minusDI);
        hi = Math.max(hi, v.minusDI);
      }
    }

    // No valid values.
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      return { lo: 0, hi: 100 };
    }

    // Always include the key level in the visible range.
    lo = Math.min(lo, this.params.keyLevel);
    hi = Math.max(hi, this.params.keyLevel);

    return { lo, hi };
  },
};
