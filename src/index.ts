import { ChartEngine } from "./core/chartEngine";

export function createChart(container: HTMLElement) {
  if (!container) return;

  const chart = new ChartEngine(container);

  return chart;
}
