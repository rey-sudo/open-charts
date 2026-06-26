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
export interface RenderPane extends TimePane{
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
