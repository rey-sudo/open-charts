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

// https://nuxt.com/docs/api/configuration/nuxt-config

import {
  PRICE_SCALE_W,
  DEFAULT_OPTIONS,
  DEFAULT_BAR_W,
  SCROLL_ZOOM_FACTOR,
  MIN_BAR_W,
  MAX_BAR_W,
} from "./core/config";
import { _mergeoptions } from "./utils/_mergeOptions";
import { _nicePriceSteps } from "./utils/_nicePriceSteps";
import { _formatDate, _formatDateFull } from "./utils/time";
import { _loadCssVariables } from "./render/theme";
import { _buildLayout } from "./ui/layout";
import { _grabCanvases } from "./render/canvas";
import { _resize } from "./core/_resize";
import { _bindEvents } from "./interactions/_bindEvents";
import { _startLoop } from "./core/_startLoop";
import { _updateScrollThumb } from "./ui/_updateScrollThumb";
import { _updateStatusBar } from "./ui/_updateStatusBar";
import { _visiblePriceRange } from "./core/_visiblePriceRange";
import { _renderMain } from "./render/_renderMain";
import { _renderPriceScale } from "./render/_renderPriceScale";
import { _renderTimeAxis } from "./render/_renderTimeAxis";
import { _timeGridStep } from "./render/_timeGridStep";
import { _isTimeGridLine } from "./render/_isTimeGridLine";
import { _xOf } from "./utils/_xOf";
import { _yOf } from "./utils/_yOf";
import { _indexAtX } from "./utils/_indexAtX";
import { _recomputeSeries } from "./core/_recomputeSeries";
import { _updateLegend } from "./ui/_updateLegend";
import { _isDifferentBar } from "./utils/_isDifferentBar";

//--------------------------------------------------------------------------------------------------------------------
//  CHART ENGINE
//--------------------------------------------------------------------------------------------------------------------

export class ChartEngine {
  constructor(area) {
    this.options = { ...DEFAULT_OPTIONS };

    this.utils = {
      _xOf: _xOf.bind(this),
      _yOf: _yOf.bind(this),
      _indexAtX: _indexAtX.bind(this),
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
    _loadCssVariables(this.options);
    _buildLayout(this.area);
    _grabCanvases.call(this);
    _resize.call(this);
    _bindEvents.call(this);
    _startLoop.call(this);
  }

  // ── DATA LOADING ──────────────────────────────────────────────────────────

  // Incremental series update — O(period) per series, not O(n).
  // Falls back to full compute() if the series has no updateIncremental hook.
  _updateSeriesIncremental(isNewBar) {
    this._series.forEach((entry) => {
      if (entry.def.updateIncremental) {
        entry.def.updateIncremental(
          entry.values,
          this.data,
          isNewBar,
          entry.params,
        );
      } else {
        entry.values = entry.def.compute(this.data, entry.params);
      }
    });
  }

  _buildDrawingApi() {
    const engine = this;
    const area = this.area;

    return {
      get canvas() {
        return engine.cDrawings;
      },
      get ctx() {
        return engine.ctxDrawings;
      },
      get viewStart() {
        return engine.viewStart;
      },
      get viewEnd() {
        return engine.viewEnd;
      },
      get barWidth() {
        return engine.barWidth;
      },
      get chartW() {
        return engine.chartW;
      },
      get data() {
        return engine.data;
      },
      get pane() {
        return engine.panes.main;
      },
      get bus() {
        return engine._bus;
      },

      // Conversiones — siempre frescas, no capturadas al mount
      // Después — directo
      xOf(i) {
        return this.utils._xOf(i);
      },

      yOf(price) {
        const { lo, hi } = _visiblePriceRange.call(this);
        return engine.utils._yOf(price, engine.panes.main, lo, hi);
      },
      indexAtX(x) {
        return engine.utils._indexAtX(x);
      },

      priceAtY(y) {
        const { lo, hi } = _visiblePriceRange.call(this);
        const h = engine.panes.main.h;
        return lo + ((hi - lo) * (h * 0.96 - y)) / (h * 0.92);
      },

      requestRedraw() {
        engine.drawingsDirty = true;
      },

      claimPointer(v) {
        engine._pointerClaimed = !!v;
        this.area.style.cursor = v ? "crosshair" : "";
      },

      // Suscripción normalizada a eventos del chart area
      // payload: { localX, localY, barIdx, price, button, original }
      on(event, fn) {
        const target = event === "mouseup" ? window : area;

        const handler = (e) => {
          const { lo, hi } = _visiblePriceRange.call(this);
          const p = engine.panes.main;
          const localX = e.clientX - p.x;
          const localY = e.clientY - p.y;
          const barIdx = engine.utils._indexAtX(localX);
          const price = lo + ((hi - lo) * (p.h * 0.96 - localY)) / (p.h * 0.92);
          fn({
            localX,
            localY,
            barIdx,
            price,
            button: e.button ?? 0,
            original: e,
          });
        };

        target.addEventListener(event, handler);
        return () => target.removeEventListener(event, handler);
      },
    };
  }

  //--------------------------------------------------------------------------------------------------------------------
  //  PUBLIC API
  //--------------------------------------------------------------------------------------------------------------------

  setData(data) {
    this.data = data;

    if (data.length >= 2) {
      let minGap = Infinity;
      const n = Math.min(data.length - 1, 10);
      for (let i = 0; i < n; i++)
        minGap = Math.min(minGap, data[i + 1].t - data[i].t);
      this.interval = minGap;
    } else {
      this.interval = 86400; // fallback: daily
    }

    _recomputeSeries.call(this);

    // Cache the close of the second-to-last bar (used by incremental RSI tick)
    this._prevClose =
      data.length >= 2 ? data[data.length - 2].c : (data[0]?.c ?? 0);

    // Start at the right end — leave rightPadBars of empty space after the last candle
    const capacity = Math.floor(this.chartW / this.barWidth);
    this.viewEnd = data.length + this.rightPadBars;
    this.viewStart = Math.max(0, this.viewEnd - capacity);
    this.dirty = true;
    _updateScrollThumb.call(this);
    _updateStatusBar.call(this);
  }

  destroy() {
    this._running = false;

    if (this._rafId) cancelAnimationFrame(this._rafId);

    this._abortController.abort();

    this._drawingModules.forEach((handle) => handle.destroy());
    this._drawingModules.clear();

    if (this.area) this.area.innerHTML = "";
  }

  applyOptions(newOptions) {
    this.options = _mergeoptions(this.options, newOptions);
    _loadCssVariables(this.options);
    this.dirty = true;
  }

  setChartType(type) {
    this.chartType = type;
    this.dirty = true;
  }

  update(candle) {
    if (!this.data.length) return this;

    const last = this.data[this.data.length - 1];
    const isNewBar =
      candle.t != null && _isDifferentBar.call(this, candle.t, last.t);

    // ── Was the viewport pinned to the live right edge before this tick?
    // "At edge" means viewEnd was within rightPadBars slots of the old data end.
    const wasAtEdge = this.viewEnd >= this.data.length;

    if (isNewBar) {
      // ── Append new candle ─────────────────────────────────────────────
      this.data.push({
        t:
          typeof candle.t === "number"
            ? candle.t
            : Math.floor(new Date(candle.t).getTime() / 1000),
        o: candle.o ?? last.c,
        h: candle.h,
        l: candle.l,
        c: candle.c,
        v: candle.v ?? 0,
      });

      this._updateSeriesIncremental(true);

      // Auto-advance viewport — slide by 1, keeping rightPadBars of empty space
      if (wasAtEdge) {
        const capacity = Math.floor(this.chartW / this.barWidth);
        this.viewEnd = this.data.length + this.rightPadBars;
        this.viewStart = Math.max(0, this.viewEnd - capacity);
      }
      _updateScrollThumb.call(this);
      _updateStatusBar.call(this);
    } else {
      // ── Tick: mutate last candle in place ─────────────────────────────
      if (candle.h != null) last.h = Math.max(last.h, candle.h);
      if (candle.l != null) last.l = Math.min(last.l, candle.l);
      if (candle.c != null) last.c = candle.c;
      if (candle.v != null) last.v = candle.v;

      this._updateSeriesIncremental(false);
    }

    this._liveMode = true;
    this.dirty = true;
    return this;
  }

  // ─── Series API ──────────────────────────────────────────────────────────

  addSeries(def) {
    const params = {};
    if (def.params) {
      for (const [k, field] of Object.entries(def.params)) {
        params[k] = { ...field }; // copy value, type, label, etc.
      }
    }

    const entry = { def, values: [], enabled: true, params };
    if (this.data.length) entry.values = def.compute(this.data);
    this._series.set(def.id, entry);
    _updateLegend.call(this);
    return this; // chainable
  }

  // Remove a series by id
  removeSeries(id) {
    this._series.delete(id);
    this.dirty = true;
    return this;
  }

  // Toggle enabled/disabled for a series by id
  toggleSeries(id) {
    const entry = this._series.get(id);
    if (!entry) return this;
    entry.enabled = !entry.enabled;
    _updateLegend.call(this);
    this.dirty = true;
    return this;
  }

  // Explicitly enable a series
  enableSeries(id) {
    const entry = this._series.get(id);
    if (entry) {
      entry.enabled = true;
      _updateLegend.call(this);
      this.dirty = true;
    }
    return this;
  }

  // Explicitly disable a series
  disableSeries(id) {
    const entry = this._series.get(id);
    if (entry) {
      entry.enabled = false;
      _updateLegend.call(this);
      this.dirty = true;
    }
    return this;
  }

  // Is a series currently enabled?
  isSeriesEnabled(id) {
    return this._series.get(id)?.enabled ?? false;
  }

  // Leer el entry completo (def + values + enabled + params)
  getSeries(id) {
    return this._series.get(id) ?? null;
  }

  // Modificar un param individual
  setSeriesParam(id, key, value) {
    const entry = this._series.get(id);
    if (!entry || !entry.params[key]) return this;
    entry.params[key].value = value;
    // Si el param afecta el cálculo → recompute completo
    if (entry.params[key].affectsCompute) {
      entry.values = entry.def.compute(this.data, entry.params);
    }
    this.dirty = true;
    return this;
  }

  // Modificar múltiples params de una vez
  setSeriesParams(id, patch) {
    const entry = this._series.get(id);
    if (!entry) return this;
    let needsRecompute = false;
    for (const [key, value] of Object.entries(patch)) {
      if (!entry.params[key]) continue;
      entry.params[key].value = value;
      if (entry.params[key].affectsCompute) needsRecompute = true;
    }
    if (needsRecompute)
      entry.values = entry.def.compute(this.data, entry.params);
    this.dirty = true;
    return this;
  }

  // Snapshot serializable — { period: 20, color: '#ffb830', ... }
  getSeriesParams(id) {
    const entry = this._series.get(id);
    if (!entry) return null;
    const out = {};
    for (const [k, field] of Object.entries(entry.params)) out[k] = field.value;
    return out;
  }

  resetZoom() {
    this.barWidth = DEFAULT_BAR_W;
    const capacity = Math.floor(this.chartW / this.barWidth);
    this.viewEnd = this.data.length + this.rightPadBars;
    this.viewStart = Math.max(0, this.viewEnd - capacity);
    this.dirty = true;
    _updateScrollThumb.call(this);
    _updateStatusBar.call(this);
  }

  addDrawingModule(moduleDef) {
    if (this._drawingModules.has(moduleDef.id)) {
      this.removeDrawingModule(moduleDef.id);
    }

    const api = this._buildDrawingApi();
    const result = moduleDef.mount(api); // módulo devuelve { render, destroy }

    const handle = {
      id: moduleDef.id,
      module: moduleDef,
      _render: result.render ?? null,
      destroy: () => {
        result.destroy?.();
        this._drawingModules.delete(moduleDef.id);
        this.drawingsDirty = true;
      },
      redraw: () => {
        this.drawingsDirty = true;
      },
    };

    Object.keys(result).forEach((k) => {
      if (!["render", "destroy"].includes(k)) handle[k] = result[k];
    });

    this._drawingModules.set(moduleDef.id, handle);
    this.drawingsDirty = true;
    return handle;
  }

  removeDrawingModule(id) {
    this._drawingModules.get(id)?.destroy();
  }
}
