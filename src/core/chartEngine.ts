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
import { _loadCssVariables } from "../core/_loadCssVariables";
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
import type {
  ChartPanes,
  ChartSeries,
  MouseState,
  PanOrigin,
  SeriesDefinition,
} from "./types/engine";

//--------------------------------------------------------------------------------------------------------------------
//  CHART ENGINE
//--------------------------------------------------------------------------------------------------------------------

export class ChartEngine {
  public options: ChartOptions;
  public utils: any;
  public api: any;
  public area: HTMLElement;

  public hasData: boolean;

  /**
   * Series registry — populated via addSeries()
   * Map<id, { def, values, enabled }>
   */
  public _series: Map<string, ChartSeries>;

  /**
   * Indicates whether the process is currently running.
   */
  public _running: boolean;

  /**
   *  Stores the current requestAnimationFrame ID.
   */
  public _rafId: number;

  /**
   * Sets the initial width, in pixels, used to render each chart bar.
   */
  public barWidth: number;

  /**
   * Bar interval in seconds. Defaults to one day (86400).
   */
  public interval: number;

  /**
   * Number of empty bar slots reserved to the right of the last data point.
   */
  public rightPadBars: number;

  /**
   * Index of the first bar currently visible in the viewport.
   */
  public viewStart: number;

  /**
   * Exclusive end index of the current visible range. May exceed
   * data.length due to reserved right-side padding bars.
   */
  public viewEnd: number;

  /**
   * Indicates whether the chart needs to be redrawn.
   *
   * When `true`, the render loop will update the visible frame.
   */
  public dirty: boolean;

  /**
   * Indicates whether the overlay layer needs to be redrawn.
   *
   * Used for transient elements such as the crosshair, cursor,
   * selection, or drawing previews without repainting the main chart.
   */
  public overlayDirty: boolean;

  /**
   * Stores the latest mouse coordinates and hover state,
   * used by overlay elements.
   */
  public mouse: MouseState;

  /**
   * Indicates whether a pan (click-and-drag navigation) interaction
   * is currently active on the chart.
   */
  public isPanning: boolean;

  /**
   * Stores the pointer position and viewport state at the start
   * of a pan operation, used to calculate drag offsets.
   */
  public panOrigin: PanOrigin;

  /**
   * Whether the viewport automatically follows the latest bar.
   */
  public _liveMode: boolean;

  /**
   * Registered drawing tool modules.
   */
  public _drawingModules: any;

  /**
   * Indicates whether pointer input is currently owned by another interaction.
   */
  public _pointerClaimed: boolean;

  /**
   * Indicates whether the drawings layer needs to be redrawn.
   */
  public drawingsDirty: boolean;

  public _dmEventHandlers: any;

  /**
   * Collection of chart panes and their layout information.
   */
  public panes: ChartPanes;

  /**
   * Stores the drawable chart width, excluding the price scale area.
   */
  public chartW: number;

  /**
   * Shared abort controller used to unregister all event listeners
   * and cancel asynchronous operations during cleanup.
   */
  public _abortController: AbortController;

  /**
   * Floating UI containers.
   */
  public legendDiv!: HTMLElement;

  /**
   * Floating UI containers.
   */
  public indicatorsDiv!: HTMLElement;

  /**
   * Main chart rendering canvas.
   */
  public cMain!: HTMLCanvasElement;

  /**
   * Main chart rendering context.
   */
  public ctxMain!: CanvasRenderingContext2D;

  /**
   * Drawings layer canvas.
   */

  public cDrawings!: HTMLCanvasElement;

  /**
   * Drawings layer rendering context.
   */
  public ctxDrawings!: CanvasRenderingContext2D;

  /**
   * Price scale canvas.
   */
  public pScale!: HTMLCanvasElement;

  /**
   * Price scale rendering context.
   */
  public ctxPScale!: CanvasRenderingContext2D;

  /**
   * Overlay canvas.
   */
  public oMain!: HTMLCanvasElement;

  /**
   * Overlay rendering context.
   */
  public ctxOMain!: CanvasRenderingContext2D;

  /**
   * Time axis canvas.
   */
  public cTime!: HTMLCanvasElement;

  /**
   * Time axis rendering context.
   */
  public ctxTime!: CanvasRenderingContext2D;

  /**
   * Main chart pane element.
   */
  public paneMainEl!: HTMLElement;

  /**
   * Time axis container element.
   */
  public timeAxisEl!: HTMLElement;

  /**
   * Horizontal scrollbar element.
   */
  public scrollbarEl!: HTMLElement;

  /**
   * Scrollbar thumb element.
   */
  public scrollThumbEl!: HTMLElement;

  /**
   * Visible bars status label.
   */
  public statusBarsEl!: HTMLElement;

  /**
   * Zoom level status label.
   */
  public statusZoomEl!: HTMLElement;

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

    this.hasData = false;

    this._series = new Map<string, ChartSeries>();

    this._running = false;

    this._rafId = 0;

    this.barWidth = DEFAULT_BAR_W;

    this.interval = 86400;

    this.rightPadBars = 20;

    this.viewStart = 0;

    this.viewEnd = 0;

    this.dirty = true;

    this.overlayDirty = true;

    this.mouse = { x: 0, y: 0, inside: false };

    this.isPanning = false;

    this.panOrigin = { x: 0, viewStart: 0 };

    this._liveMode = false;

    this._drawingModules = new Map();

    this._pointerClaimed = false;

    this.drawingsDirty = false;

    this._dmEventHandlers = {};

    this.panes = {} as ChartPanes;

    this.chartW = 0;

    this._abortController = new AbortController();

    _loadCssVariables(this);
    _buildLayout(this);
    _grabCanvases(this);
  }

  _init() {
    _resize(this);
    _bindEvents(this);
    _startLoop(this);
  }

  get data() {
    return this._series.values().next().value?.data || [];
  }

  addSeries(def: SeriesDefinition) {
    return addSeries(this, def);
  }
}
