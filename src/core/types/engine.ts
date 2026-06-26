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

  /** Display name. */
  params: Record<string, any>;

  /** Rendering layer. */
  layer: "background" | "foreground";

  /** Recomputes the indicator values. */
  compute(engine: ChartEngine): unknown[];

  /** Renders the indicator. */
  render(
    ctx: CanvasRenderingContext2D,
    pane: RenderPane,
    engine: ChartEngine,
    values: unknown[],
    priceMin: number,
    priceMax: number,
  ): void;

  updateIncremental(values: any[], data: any[], isNewBar: boolean): void;

  tooltipRow(values: any[], i: number): any;
}

/**
 * Registered indicator instance.
 */
export interface ChartSeries {
  /** Indicator definition. */
  def: SeriesDefinition;

  /** Computed indicator values. */
  values: unknown[];

  /** Whether the indicator is currently enabled. */
  enabled: boolean;

  /** User-defined indicator parameters. */
  params: Record<string, unknown>;
}
