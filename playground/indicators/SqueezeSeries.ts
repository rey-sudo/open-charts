import { PriceRange } from "../../src/core/_visiblePriceRange";
import type { ChartEngine } from "../../src/core/chartEngine";
import type {
  MainPane,
  PriceTag,
  SeriesDefinition,
} from "../../src/core/types";
import { drawHistogramSeries } from "../helpers/drawHistogramSeries";

export interface Candle {
  high: number;
  low: number;
  close: number;
}

export interface SqueezeValue {
  value: number;
  color: string;
  squeezeColor: string;
  squeezeOn: boolean;
  squeezeOff: boolean;
  noSqueeze: boolean;
}

export const SqueezeSeries: SeriesDefinition<
  Candle,
  SqueezeValue,
  {
    length: number;
    mult: number;
    lengthKC: number;
    multKC: number;
    useTrueRange: boolean;
  }
> = {
  id: "squeeze",

  label: "Squeeze Momentum",

  color: "#00ff00",

  layer: "foreground",

  params: {
    length: 20,
    mult: 2,
    lengthKC: 20,
    multKC: 1.5,
    useTrueRange: true,
  },

  compute(data) {
    const high = data.map((d) => d.high);
    const low = data.map((d) => d.low);
    const close = data.map((d) => d.close);

    return calculateSqueezeMomentum(
      high,
      low,
      close,
      this.params.length,
      this.params.mult,
      this.params.lengthKC,
      this.params.multKC,
      this.params.useTrueRange,
    );
  },

  updateIncremental(values, data) {
    values.splice(0, values.length, ...this.compute(data));
  },

  valueRange(data, values, start, end): PriceRange {
    let lo = Infinity;
    let hi = -Infinity;

    for (let i = start; i < end; i++) {
      const v = values[i];

      if (!v || !Number.isFinite(v.value)) {
        continue;
      }

      lo = Math.min(lo, v.value);
      hi = Math.max(hi, v.value);
    }

    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      return { lo: -1, hi: 1 };
    }

    return {
      lo: Math.min(lo, 0),
      hi: Math.max(hi, 0),
    };
  },

  render(
    ctx,
    pane: MainPane,
    engine: ChartEngine,
    data,
    values,
    valueMin,
    valueMax,
  ) {
    drawHistogramSeries(
      ctx,
      pane,
      engine,
      values,
      valueMin,
      valueMax,
      (v: any) => v.value,
      (v: any) => v.color,
    );

    // TODO:
    // Draw the squeeze dots at the zero line using v.squeezeColor.
  },

  tooltipRow(values, index) {
    const v = values[index];

    if (!v) {
      return null;
    }

    return {
      label: "SQZMOM",
      value: v.value.toFixed(2),
      color: v.color,
    };
  },

  priceTags(data, values): readonly PriceTag[] {
    const last = values.at(-1);

    if (!last || !Number.isFinite(last.value)) {
      return [];
    }

    return [
      {
        value: last.value,
        color: last.color,
        label: "SQZMOM",
      },
    ];
  },
};

//------------------------------------------

export function sma(src: readonly number[], length: number): number[] {
  const out = new Array(src.length).fill(NaN);

  let sum = 0;

  for (let i = 0; i < src.length; i++) {
    sum += src[i];

    if (i >= length) {
      sum -= src[i - length];
    }

    if (i >= length - 1) {
      out[i] = sum / length;
    }
  }

  return out;
}

export function stdev(src: readonly number[], length: number): number[] {
  const out = new Array(src.length).fill(NaN);
  const ma = sma(src, length);

  for (let i = length - 1; i < src.length; i++) {
    let sum = 0;

    for (let j = i - length + 1; j <= i; j++) {
      const d = src[j] - ma[i];
      sum += d * d;
    }

    out[i] = Math.sqrt(sum / length);
  }

  return out;
}

export function highest(src: readonly number[], length: number): number[] {
  const out = new Array(src.length).fill(NaN);

  for (let i = length - 1; i < src.length; i++) {
    let h = -Infinity;

    for (let j = i - length + 1; j <= i; j++) {
      h = Math.max(h, src[j]);
    }

    out[i] = h;
  }

  return out;
}

export function lowest(src: readonly number[], length: number): number[] {
  const out = new Array(src.length).fill(NaN);

  for (let i = length - 1; i < src.length; i++) {
    let l = Infinity;

    for (let j = i - length + 1; j <= i; j++) {
      l = Math.min(l, src[j]);
    }

    out[i] = l;
  }

  return out;
}

export function trueRange(
  high: readonly number[],
  low: readonly number[],
  close: readonly number[],
): number[] {
  const out = new Array(high.length);

  out[0] = high[0] - low[0];

  for (let i = 1; i < high.length; i++) {
    out[i] = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - close[i - 1]),
      Math.abs(low[i] - close[i - 1]),
    );
  }

  return out;
}

export function linreg(src: readonly number[], length: number): number[] {
  const out = new Array(src.length).fill(NaN);

  const xMean = (length - 1) / 2;

  let xx = 0;

  for (let i = 0; i < length; i++) {
    const d = i - xMean;
    xx += d * d;
  }

  for (let i = length - 1; i < src.length; i++) {
    let yMean = 0;

    for (let j = 0; j < length; j++) {
      yMean += src[i - length + 1 + j];
    }

    yMean /= length;

    let xy = 0;

    for (let j = 0; j < length; j++) {
      xy += (j - xMean) * (src[i - length + 1 + j] - yMean);
    }

    const slope = xy / xx;
    const intercept = yMean - slope * xMean;

    out[i] = intercept + slope * (length - 1);
  }

  return out;
}

export interface SqueezeValue {
  value: number;
  color: string;
  squeezeColor: string;
  squeezeOn: boolean;
  squeezeOff: boolean;
  noSqueeze: boolean;
}

export function calculateSqueezeMomentum(
  high: readonly number[],
  low: readonly number[],
  close: readonly number[],
  length = 20,
  mult = 2,
  lengthKC = 20,
  multKC = 1.5,
  useTrueRange = true,
): SqueezeValue[] {
  const basis = sma(close, length);
  const dev = stdev(close, length);

  const upperBB = basis.map((v, i) => v + dev[i] * mult);
  const lowerBB = basis.map((v, i) => v - dev[i] * mult);

  const ma = sma(close, lengthKC);

  const range = useTrueRange
    ? trueRange(high, low, close)
    : high.map((h, i) => h - low[i]);

  const rangeMA = sma(range, lengthKC);

  const upperKC = ma.map((v, i) => v + rangeMA[i] * multKC);
  const lowerKC = ma.map((v, i) => v - rangeMA[i] * multKC);

  const hh = highest(high, lengthKC);
  const ll = lowest(low, lengthKC);
  const closeMA = sma(close, lengthKC);

  const src = close.map((c, i) => {
    const mid = ((hh[i] + ll[i]) / 2 + closeMA[i]) / 2;

    return c - mid;
  });

  const momentum = linreg(src, lengthKC);

  return momentum.map((value, i) => {
    const prev = Number.isFinite(momentum[i - 1]) ? momentum[i - 1] : 0;

    const squeezeOn = lowerBB[i] > lowerKC[i] && upperBB[i] < upperKC[i];

    const squeezeOff = lowerBB[i] < lowerKC[i] && upperBB[i] > upperKC[i];

    const noSqueeze = !squeezeOn && !squeezeOff;

    let color: string;

    if (!Number.isFinite(value)) {
      color = "#00000000";
    } else if (value >= 0) {
      color =
        value > prev
          ? "#00FF00" // lime
          : "#008000"; // green
    } else {
      color =
        value < prev
          ? "#FF0000" // red
          : "#800000"; // maroon
    }

    const squeezeColor = noSqueeze
      ? "#2962FF" // blue
      : squeezeOn
        ? "#000000" // black
        : "#808080"; // gray

    return {
      value,
      color,
      squeezeColor,
      squeezeOn,
      squeezeOff,
      noSqueeze,
    };
  });
}
