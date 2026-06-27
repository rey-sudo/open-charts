import { _clampView } from "../_clampView";
import type { ChartEngine } from "../chartEngine";

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

    this.engine.resetViewport();
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
