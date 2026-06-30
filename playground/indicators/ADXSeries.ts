import type { ChartEngine } from "../../src/core/chartEngine";
import type { MainPane, SeriesDefinition } from "../../src/core/types";
import { drawLineSeries } from "../helpers/drawLineSeries";

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

    //console.log(result);

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

//----------------------------------------------------------------------------------------------------------------------
// LOGIC
//----------------------------------------------------------------------------------------------------------------------

export interface ADXResult {
  adx: number[];
  plusDI: number[];
  minusDI: number[];
  reversal: boolean[];
}

function change(src: number[]): number[] {
  const out = new Array(src.length).fill(NaN);

  for (let i = 1; i < src.length; i++) {
    out[i] = src[i] - src[i - 1];
  }

  return out;
}

function trueRange(high: number[], low: number[], close: number[]): number[] {
  const tr = new Array(high.length);

  tr[0] = high[0] - low[0];

  for (let i = 1; i < high.length; i++) {
    const hl = high[i] - low[i];
    const hc = Math.abs(high[i] - close[i - 1]);
    const lc = Math.abs(low[i] - close[i - 1]);

    tr[i] = Math.max(hl, hc, lc);
  }

  return tr;
}

/**
 * Pine ta.rma()
 * Exact implementation.
 */
export function rma(src: number[], length: number): number[] {
  const out = new Array(src.length).fill(NaN);

  let sum = 0;
  let count = 0;

  for (let i = 0; i < src.length; i++) {
    const v = src[i];

    if (!Number.isFinite(v)) {
      continue;
    }

    if (count < length) {
      sum += v;
      count++;

      if (count === length) {
        out[i] = sum / length;
      }

      continue;
    }

    out[i] = (out[i - 1] * (length - 1) + v) / length;
  }

  return out;
}

function directionalMovement(
  high: number[],
  low: number[],
  close: number[],
  length: number,
) {
  const upMove = change(high);
  const downMove = change(low).map((v) => -v);

  const plusDM = new Array(high.length).fill(0);
  const minusDM = new Array(high.length).fill(0);

  for (let i = 1; i < high.length; i++) {
    plusDM[i] = upMove[i] > downMove[i] && upMove[i] > 0 ? upMove[i] : 0;

    minusDM[i] = downMove[i] > upMove[i] && downMove[i] > 0 ? downMove[i] : 0;
  }

  const tr = trueRange(high, low, close);

  const trRma = rma(tr, length);
  const plusRma = rma(plusDM, length);
  const minusRma = rma(minusDM, length);

  const plusDI = new Array(high.length).fill(NaN);
  const minusDI = new Array(high.length).fill(NaN);

  for (let i = 0; i < high.length; i++) {
    plusDI[i] = (100 * plusRma[i]) / trRma[i];
    minusDI[i] = (100 * minusRma[i]) / trRma[i];
  }

  return {
    plusDI,
    minusDI,
  };
}

export function calculateADX(
  high: number[],
  low: number[],
  close: number[],
  diLength = 14,
  adxLength = 14,
  keyLevel = 23,
): ADXResult {
  const { plusDI, minusDI } = directionalMovement(high, low, close, diLength);

  const dx = new Array(high.length).fill(NaN);

  for (let i = 0; i < high.length; i++) {
    const sum = plusDI[i] + minusDI[i];

    dx[i] = (100 * Math.abs(plusDI[i] - minusDI[i])) / (sum === 0 ? 1 : sum);
  }

  const adx = rma(dx, adxLength);

  const reversal = new Array(high.length).fill(false);

  for (let i = 2; i < high.length; i++) {
    const rule1 = adx[i] < adx[i - 1];
    const rule2 = adx[i - 1] > adx[i - 2];
    const rule3 = adx[i - 1] > keyLevel;

    reversal[i] = rule1 && rule2 && rule3;
  }

  return {
    adx,
    plusDI,
    minusDI,
    reversal,
  };
}
