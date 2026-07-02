import type { ChartEngine } from "../core/chartEngine";

export function _buildLegend(engine: ChartEngine) {
  let legendContainer = engine.legendDiv.querySelector<HTMLDivElement>(
    "#chart-legend-content",
  );

  const content = `<span class="chart-legend-item"><span class="chart-legend-symbol">${engine.options.legend}</span></span>`;

  if (!legendContainer) {
    legendContainer = document.createElement("div");
    legendContainer.id = "chart-legend-content";
    engine.legendDiv.appendChild(legendContainer);
  }

  legendContainer.innerHTML = content;
}
