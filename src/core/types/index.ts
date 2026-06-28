import { _clampView } from "../_clampView";
import { _loadCssVariables } from "../_loadCssVariables";
import type { ChartEngine } from "../chartEngine";
import { _resetViewport } from "../_resetViewport";
import { _buildLayout } from "../_buildLayout";
import { _grabCanvases } from "../_grabCanvases";
import { _resize } from "../_resize";
import { _bindEvents } from "../_bindEvents";
import { _startLoop } from "../_startLoop";

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
export interface RenderPane extends TimePane {
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
  main: RenderPane;

  /** Right-side price scale. */
  scale: ScalePane;

  /** Bottom time axis. */
  time: TimePane;
}

export type ChartPane = RenderPane | ScalePane | TimePane;

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

/**
 * Indicator definition.
 */
export interface SeriesDefinition {
  /** Unique indicator identifier. */
  id: string;

  label: string;

  color: string;

  /** Display name. */
  params: Record<string, any>;

  /** Rendering layer. */
  layer: "background" | "foreground";

  /** Recomputes the indicator values. */
  compute(data: any): unknown[];

  /** Renders the indicator. */
  render(
    ctx: CanvasRenderingContext2D,
    pane: RenderPane,
    engine: ChartEngine,
    data: any,
    values: unknown[],
    priceMin: number,
    priceMax: number,
  ): void;

  updateIncremental(values: any[], data: any[], isNewBar: boolean): void;

  tooltipRow(values: any[], i: number): any;
}

/**
 * Represents a chart series.
 *
 * A series owns its data, computed values, parameters,
 * and exposes the public API used by consumers.
 */
export class ChartSeries {
  /** Indicator definition. */
  public readonly def: SeriesDefinition;

  /** Source data for the series. */
  public data: unknown[] = [];

  /** Computed values used for rendering. */
  public values: unknown[] = [];

  /** Whether the series is currently visible. */
  public enabled = true;

  /** User-defined series parameters. */
  public params: Record<string, unknown>;

  constructor(
    private readonly engine: ChartEngine,
    def: SeriesDefinition,
    params: Record<string, unknown> = {},
  ) {
    this.def = def;
    this.params = params;
  }

  /**
   * Replaces the series data.
   *
   * @param data New data set.
   * @returns The series instance.
   */
  public setData(data: unknown[]): this {
    this.data = data;

    if (this.def.compute) {
      this.values = this.def.compute(data);
    }

    this.engine.core.resetViewport();
    this.engine.hasData = true;
    this.engine.dirty = true;

    return this;
  }

  /**
   * Appends or updates the latest data point.
   *
   * @param bar New bar.
   * @returns The series instance.
   */
  public update(bar: unknown): this {
    this.data.push(bar);

    if (this.def.compute) {
      this.values = this.def.compute(this.data);
    }

    this.engine.dirty = true;
    this.engine.hasData = true;

    return this;
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
   * Resets the viewport to the default position.
   *
   * This function is typically called after loading a new dataset or
   * whenever the chart should display the most recent bars.
   *
   * The viewport is positioned at the end of the available data, then
   * clamped to ensure it satisfies the current chart constraints.
   */
  public resetViewport(): void {
    _resetViewport(this.engine);
  }

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

}
