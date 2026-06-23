export const PRICE_SCALE_W = 72;
export const MIN_BAR_W = 1;
export const MAX_BAR_W = 40;
export const DEFAULT_BAR_W = 8;
export const SCROLL_ZOOM_FACTOR = 0.12;

export type ChartType = "candlestick" | "line" | "area";

export interface ChartColors {
  bg: string;
  bg2: string;
  bg3: string;

  grid: string;
  gridAlt: string;

  text: string;
  textDim: string;

  bull: string;
  bear: string;

  bullDim: string;
  bearDim: string;

  line: string;

  area1: string;
  area2: string;

  ma: string;

  bb: string;
  bbFill: string;

  cross: string;
  crossPt: string;

  vol: string;
  volBull: string;
  volBear: string;
}

export interface ChartOptions {
  chartType: ChartType;
  rightPadBars: number;
  barWidth: number;
  minBarWidth: number;
  maxBarWidth: number;
  zoomFactor: number;
  colors: ChartColors;
}

export const DEFAULT_OPTIONS: ChartOptions = {
  chartType: "candlestick",
  rightPadBars: 20,
  barWidth: DEFAULT_BAR_W,
  minBarWidth: MIN_BAR_W,
  maxBarWidth: MAX_BAR_W,
  zoomFactor: SCROLL_ZOOM_FACTOR,

  colors: {
    bg: "#181A20",
    bg2: "#1E2329",
    bg3: "#2B3139",

    grid: "rgba(43,49,57,0.35)",
    gridAlt: "rgba(43,49,57,0.15)",

    text: "#EAECEF",
    textDim: "#848E9C",

    bull: "rgb(8,153,129)",
    bear: "rgb(242,54,69)",

    bullDim: "rgba(8,153,129,0.15)",
    bearDim: "rgba(242,54,69,0.15)",

    line: "#F0B90B",

    area1: "rgba(240,185,11,0.18)",
    area2: "rgba(240,185,11,0)",

    ma: "#F0B90B",

    bb: "#A970FF",
    bbFill: "rgba(169,112,255,0.08)",

    cross: "rgba(234,236,239,0.25)",
    crossPt: "#F0B90B",

    vol: "rgba(240,185,11,0.25)",
    volBull: "rgba(8,153,129,0.35)",
    volBear: "rgba(242,54,69,0.35)",
  },
};
