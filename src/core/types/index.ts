import { _loadCssVariables } from "../_loadCssVariables";
import type { ChartEngine } from "../chartEngine";
import { _buildLayout } from "../_buildLayout";
import { _grabCanvases } from "../_grabCanvases";
import { _resize } from "../_resize";
import { _bindEvents } from "../_bindEvents";
import { _startLoop } from "../_startLoop";
import { _visiblePriceRange, type PriceRange } from "../_visiblePriceRange";

/**
 * Pane with geometry only.
 */
export interface TimePane {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Pane that owns a rendering canvas.
 */
export interface MainPane extends TimePane {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  oCtx: CanvasRenderingContext2D;
}

/**
 * Price scale dimensions.
 */
export interface ScalePane {
  w: number;
  h: number;
}

/**
 * Collection of panes managed by the chart engine.
 */
export interface ChartPanes {
  /** Main chart pane. */
  main: MainPane;

  /** Right-side price scale. */
  scale: ScalePane;

  /** Bottom time axis. */
  time: TimePane;
}

export type ChartPane = MainPane | ScalePane | TimePane;

/**
 * Current mouse state.
 */
export interface MouseState {
  /** Mouse X position in CSS pixels. */
  x: number;

  /** Mouse Y position in CSS pixels. */
  y: number;

  /** Whether the pointer is inside the chart area. */
  inside: boolean;
}

/**
 * Initial viewport state captured when a pan gesture starts.
 */
export interface PanOrigin {
  /** Pointer X position at the start of the pan. */
  x: number;

  /** First visible bar index when the pan started. */
  viewStart: number;
}

export interface SeriesDefinition<
  TData,
  TValue,
  TParams = Record<string, unknown>,
  TTooltip = unknown,
> {
  /** Unique series identifier. */
  id: string;

  /** Display label. */
  label: string;

  /** Default series color. */
  color: string;

  /** Rendering layer. */
  layer: "background" | "foreground";

  /** Series parameters. */
  params: TParams;

  /** Computes indicator values from the source data. */
  compute(data: readonly TData[]): TValue[];

  /** Renders the series. */
  render(
    ctx: CanvasRenderingContext2D,
    pane: MainPane,
    engine: ChartEngine,
    data: readonly TData[],
    values: readonly TValue[],
    priceMin: number,
    priceMax: number,
  ): void;

  /** Updates the cached values incrementally. */
  updateIncremental(
    values: TValue[],
    data: readonly TData[],
    isNewBar: boolean,
  ): void;

  /** Returns a tooltip row for the given index. */
  tooltipRow(values: readonly TValue[], index: number): TTooltip | null;

  /** Returns the last visible value for the price scale. */
  lastValue?(data: readonly TData[], values: readonly TValue[]): number | null;

  /** Optional price tag color. */
  priceTagColor?: string;
}

export type AnyChartSeries = ChartSeries<
  unknown,
  unknown,
  Record<string, unknown>
>;

/**
 * Represents a chart series.
 *
 * A series owns its data, computed values, parameters,
 * and exposes the public API used by consumers.
 */
export class ChartSeries<TData, TValue, TParams = Record<string, unknown>> {
  /** Indicator definition. */
  public readonly def: SeriesDefinition<TData, TValue, TParams>;

  /** Source data for the series. */
  public data: TData[] = [];

  /** Computed values used for rendering. */

  public values: TValue[] = [];

  /** Whether the series is currently visible. */
  public enabled: boolean = true;

  public interval: number = 0;

  /** User-defined series parameters. */
  public params: TParams;

  constructor(
    private readonly engine: ChartEngine,
    def: SeriesDefinition<TData, TValue, TParams>,
    params: TParams,
  ) {
    this.def = def;
    this.params = params;
  }

  /**
   * Returns the interval between consecutive bars in seconds.
   *
   * The interval is inferred from the primary series data.
   * If there are fewer than two bars, zero is returned.
   *
   * @returns Bar interval in seconds.
   */
  public getInterval(): number {
    const data: any[] = this.data;

    for (let i = 1; i < data.length; i++) {
      const interval = data[i].time - data[i - 1].time;

      if (interval > 0) {
        return interval;
      }
    }

    return 0;
  }

  /**
   * Replaces the series data.
   *
   * @param data New data set.
   * @returns The series instance.
   */
  public setData(data: readonly TData[]): void {
    this.data = [...data];

    this.values = this.def.compute(data);

    this.engine.hasData = data.length > 0;

    if (!this.engine.hasData) return;

    this.interval = this.getInterval();

    this.engine.timeScale.resetViewport();

    this.engine.priceScale.updateLayout();

    this.engine.dirty = true;
  }

  /**
   * Appends or updates the latest data point.
   *
   * @param bar New bar.
   * @returns The series instance.
   */
  public update(bar: TData): boolean {
    this.data.push(bar);

    this.values = this.def.compute(this.data);

    this.engine.hasData = this.data.length > 0;

    if (!this.engine.hasData) return false;

    this.interval = this.getInterval();

    this.engine.timeScale.resetViewport();

    this.engine.priceScale.updateLayout();

    this.engine.dirty = true;

    return true;
  }

  /**
   * Enables or disables the series.
   *
   * @param visible Whether the series should be rendered.
   * @returns The series instance.
   */
  public setVisible(visible: boolean): this {
    this.enabled = visible;
    this.engine.dirty = true;

    return this;
  }

  /**
   * Removes the series from the chart.
   */
  public remove(): void {
    this.engine._series.delete(this.def.id);
    this.engine.dirty = true;
    this.engine.hasData = false;
  }
}

/**
 * Core API.
 */
export class ChartCore {
  constructor(private readonly engine: ChartEngine) {}

  /**
   * Applies configured color values as CSS custom properties
   * on the document root element.
   */
  public loadCssVariables(): void {
    _loadCssVariables(this.engine);
  }

  /**
   * Builds and injects the chart DOM structure into the container.
   *
   * The layout includes:
   * - Main chart pane and rendering canvases
   * - Time axis
   * - Horizontal scrollbar
   * - Legend and indicators containers
   * - Debug/status bar
   */
  public buildLayout(): void {
    _buildLayout(this.engine);
  }

  /**
   * Retrieves all chart DOM elements and initializes their
   * corresponding 2D rendering contexts.
   */
  public grabCanvases(): void {
    _grabCanvases(this.engine);
  }

  /**
   * Recomputes the chart layout after the container size changes.
   *
   * This function synchronizes every rendering surface with the current
   * layout, updates pane geometry, recalculates the drawable chart width,
   * validates the viewport, and schedules a full redraw.
   *
   * This function should be called whenever:
   *
   * - The window is resized.
   * - The chart container changes size.
   * - The device pixel ratio changes.
   */
  public resize(): void {
    _resize(this.engine);
  }

  /**
   * Registers all user interaction and lifecycle event handlers
   * required by the chart, including mouse, touch, scrolling,
   * zooming, panning, scrollbar dragging, and window resizing.
   */
  public bindEvents(): void {
    _bindEvents(this.engine);
  }

  /**
   * Starts the chart render loop.
   *
   * The loop runs continuously using `requestAnimationFrame` and
   * redraws only the layers that have been marked as dirty.
   *
   * Rendering is split into independent passes:
   * - Main chart
   * - Drawings
   * - Overlay
   */
  public startLoop(): void {
    _startLoop(this.engine);
  }

  public visiblePriceRange(): PriceRange {
    return _visiblePriceRange(this.engine);
  }
}
