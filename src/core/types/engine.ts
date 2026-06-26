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
