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

import {
  DEFAULT_OPTIONS,
  DEFAULT_BAR_W,
  type ChartOptions,
} from "../core/config";
import { _nicePriceSteps } from "../utils/_nicePriceSteps";
import { _formatDate, _formatDateFull } from "../utils/time";
import { _loadCssVariables } from "../render/_loadCssVariables";
import { _buildLayout } from "../ui/_buildLayout";
import { _grabCanvases } from "../render/_grabCanvases";
import { _resize } from "../core/_resize";
import { _bindEvents } from "../interactions/_bindEvents";
import { _startLoop } from "../core/_startLoop";
import { _updateScrollThumb } from "../ui/_updateScrollThumb";
import { _updateStatusBar } from "../ui/_updateStatusBar";
import { _visiblePriceRange } from "../core/_visiblePriceRange";
import { _renderMain } from "../render/_renderMain";
import { _renderPriceScale } from "../render/_renderPriceScale";
import { _renderTimeAxis } from "../render/_renderTimeAxis";
import { _timeGridStep } from "../render/_timeGridStep";
import { _isTimeGridLine } from "../render/_isTimeGridLine";
import { _xOf } from "../utils/_xOf";
import { _yOf } from "../utils/_yOf";
import { _indexAtX } from "../utils/_indexAtX";
import { _recomputeSeries } from "../core/_recomputeSeries";
import { _updateLegend } from "../ui/_updateLegend";
import { _isDifferentBar } from "../utils/_isDifferentBar";
import { _updateSeriesIncremental } from "../core/_updateSeriesIncremental";
import { applyOptions } from "../api/applyOptions";
import { setData } from "../api/setData";
import { destroy } from "../api/detroy";
import { update } from "../api/update";
import { addSeries } from "../api/addSeries";
import { removeSeries } from "../api/removeSeries";
import { toggleSeries } from "../api/toggleSeries";
import { enableSeries } from "../api/enableSeries";
import { disableSeries } from "../api/disableSeries";
import { isSeriesEnabled } from "../api/isSeriesEnabled";
import { getSeries } from "../api/getSeries";
import { setSeriesParam } from "../api/setSeriesParam";
import { setSeriesParams } from "../api/setSeriesParams";
import { getSeriesParams } from "../api/getSeriesParams";
import { resetZoom } from "../api/resetZoom";
import { addDrawingModule } from "../api/addDrawingModule";

//--------------------------------------------------------------------------------------------------------------------
//  CHART ENGINE
//--------------------------------------------------------------------------------------------------------------------

export class ChartEngine {
  public options: ChartOptions;
  public utils: any;
  public api: any;
  public area: any;
  public data: any;
  public _series: any;
  public _running: any;
  public _rafId: any;
  public barWidth: number;
  public interval: any;
  public rightPadBars: any;
  public viewStart: number;
  public viewEnd: any;
  public dirty: any;
  public overlayDirty: any;
  public chartType: any;
  public mouse: any;
  public isPanning: any;
  public panOrigin: any;
  public _liveMode: any;
  public _prevClose: any;
  public _drawingModules: any;
  public _pointerClaimed: any;
  public drawingsDirty: any;
  public _dmEventHandlers: any;
  public fps: any;
  public _fpsFrames: any;
  public _fpsTime: any;
  public panes: any;
  public chartW: any;
  public _abortController: any;

  public legendDiv: HTMLElement | undefined;
  public indicatorsDiv: HTMLElement | undefined;

  public cMain: HTMLCanvasElement | undefined;
  public ctxMain: CanvasRenderingContext2D | undefined;

  public cDrawings: any;
  public ctxDrawings: CanvasRenderingContext2D | undefined;

  public pScale: any;
  public ctxPScale: CanvasRenderingContext2D | undefined;

  public oMain: any;
  public ctxOMain: CanvasRenderingContext2D | undefined;

  public cTime: any;
  public ctxTime: CanvasRenderingContext2D | undefined;

  public paneMainEl: HTMLElement | undefined;
  public timeAxisEl: HTMLElement | undefined;
  public scrollbarEl: HTMLElement | undefined;
  public scrollThumbEl: HTMLElement | undefined;
  public statusFpsEl: HTMLElement | undefined;
  public statusBarsEl: HTMLElement | undefined;
  public statusZoomEl: HTMLElement | undefined;

  constructor(area: HTMLElement) {
    this.options = { ...DEFAULT_OPTIONS };

    this.utils = {
      _xOf: _xOf.bind(this),
      _yOf: _yOf.bind(this),
      _indexAtX: _indexAtX.bind(this),
    };

    this.api = {
      setData: setData.bind(this),
      applyOptions: applyOptions.bind(this),
      destroy: destroy.bind(this),
      update: update.bind(this),
      addSeries: addSeries.bind(this),
      removeSeries: removeSeries.bind(this),
      toggleSeries: toggleSeries.bind(this),
      enableSeries: enableSeries.bind(this),
      disableSeries: disableSeries.bind(this),
      isSeriesEnabled: isSeriesEnabled.bind(this),
      getSeries: getSeries.bind(this),
      setSeriesParam: setSeriesParam.bind(this),
      setSeriesParams: setSeriesParams.bind(this),
      getSeriesParams: getSeriesParams.bind(this),
      resetZoom: resetZoom.bind(this),
      addDrawingModule: addDrawingModule.bind(this),
    };

    this.area = area;

    // Data
    this.data = [];

    // Series registry — populated via addSeries()
    // Map<id, { def, values, enabled }>
    this._series = new Map();

    /**
     * Indicates whether the process is currently running.
     */
    this._running = false;

    /**
     *  Stores the current requestAnimationFrame ID.
     */
    this._rafId = null;

    /**
     * Sets the initial width, in pixels, used to render each chart bar.
     */
    this.barWidth = DEFAULT_BAR_W;
    this.interval = 86400;
    /**
     * Number of empty bar slots reserved to the right of the last data point.
     */
    this.rightPadBars = 20;

    /**
     * Index of the first bar currently visible in the viewport.
     */
    this.viewStart = 0;

    /**
     * Exclusive end index of the current visible range. May exceed
     * data.length due to reserved right-side padding bars.
     */
    this.viewEnd = 0;

    // Render state
    this.dirty = true;
    this.overlayDirty = true;
    this.chartType = "candlestick";

    /**
     * Stores the latest mouse coordinates and hover state,
     * used by overlay elements.
     */
    this.mouse = { x: 0, y: 0, inside: false };

    /**
     * Indicates whether a pan (click-and-drag navigation) interaction
     * is currently active on the chart.
     */
    this.isPanning = false;

    /**
     * Stores the pointer position and viewport state at the start
     * of a pan operation, used to calculate drag offsets.
     */
    this.panOrigin = { x: 0, viewStart: 0 };

    // Live update state
    this._liveMode = false; // true while receiving ticks
    this._prevClose = 0; // close of bar before current (for RSI tick)

    this._drawingModules = new Map(); // Map<id, handle>

    /**
     * Indicates whether pointer input is currently owned by another interaction.
     */
    this._pointerClaimed = false;

    this.drawingsDirty = false; // flag para el RAF loop
    this._dmEventHandlers = {}; // listeners internos del engine hacia los módulos

    // Perf
    this.fps = 60;
    this._fpsFrames = 0;
    this._fpsTime = performance.now();

    // Panes geometry (computed in resize)
    this.panes = {};

    /**
     * Stores the drawable chart width, excluding the price scale area.
     */
    this.chartW = 0;

    this._abortController = new AbortController();

    this._init();
  }

  _init() {
    _loadCssVariables.call(this);
    _buildLayout.call(this);
    _grabCanvases.call(this);
    _resize.call(this);
    _bindEvents.call(this);
    _startLoop.call(this);
  }
}
