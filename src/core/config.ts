// OPEN-CHARTS
// Copyright (C) 2026 Juan José Caballero Rey - https://github.com/rey-sudo
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation version 3 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

export const PRICE_SCALE_W: number = 72;
export const MIN_BAR_W: number = 1;
export const MAX_BAR_W: number = 40;
export const DEFAULT_BAR_W: number = 8;
export const SCROLL_ZOOM_FACTOR: number = 0.1;

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

  accent: string;
}

export interface ChartOptions {
  rightPadBars: number;
  barWidth: number;
  minBarWidth: number;
  maxBarWidth: number;
  zoomFactor: number;
  colors: ChartColors;
}

export const DEFAULT_OPTIONS: ChartOptions = {
  rightPadBars: 20,
  barWidth: DEFAULT_BAR_W,
  minBarWidth: MIN_BAR_W,
  maxBarWidth: MAX_BAR_W,
  zoomFactor: SCROLL_ZOOM_FACTOR,

  colors: {
    bg: "#1c1c1e",
    bg2: "#262626",
    bg3: "#2f2f2f",

    grid: "rgba(42,42,42,0.5)",
    gridAlt: "rgba(42,42,42,0.6)",

    text: "#E4E4E7",
    textDim: "#6b6b6b",

    bull: "#089981",
    bear: "#F23645",
    bullDim: "rgba(8,153,129,0.15)",
    bearDim: "rgba(242,54,69,0.15)",

    line: "#2962FF",
    area1: "rgba(41,98,255,0.28)",
    area2: "rgba(41,98,255,0)",
    ma: "#F7525F",
    bb: "#2962FF",
    bbFill: "rgba(41,98,255,0.05)",

    cross: "rgba(228,228,231,0.20)",
    crossPt: "#2962FF",

    vol: "rgba(100,100,100,0.25)",
    volBull: "rgba(8,153,129,0.3)",
    volBear: "rgba(242,54,69,0.3)",

    accent: "#2962FF",
  },
};
