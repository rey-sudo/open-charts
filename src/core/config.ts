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

export const PRICE_SCALE_W = 72;
export const MIN_BAR_W = 1;
export const MAX_BAR_W = 40;
export const DEFAULT_BAR_W = 8;
export const SCROLL_ZOOM_FACTOR = 0.12;

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
    bg: "#18181B",
    bg2: "#232326",
    bg3: "#2F2F33",

    grid: "rgba(120,120,128,0.18)",
    gridAlt: "rgba(120,120,128,0.10)",

    text: "#E4E4E7",
    textDim: "#A1A1AA",

    bull: "#8B8B8B",
    bear: "#5F5F66",

    bullDim: "rgba(139,139,139,0.15)",
    bearDim: "rgba(95,95,102,0.15)",

    line: "#B3B3B3",

    area1: "rgba(179,179,179,0.18)",
    area2: "rgba(179,179,179,0)",

    ma: "#909090",

    bb: "#757575",
    bbFill: "rgba(117,117,117,0.10)",

    cross: "rgba(228,228,231,0.20)",
    crossPt: "#C7C7CC",

    vol: "rgba(179,179,179,0.20)",
    volBull: "rgba(139,139,139,0.25)",
    volBear: "rgba(95,95,102,0.25)",
  },
};
