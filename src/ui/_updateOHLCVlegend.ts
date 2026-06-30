//TODO: this not depends of the addSeries. This depends of main config of ChartEngine
// SYMBOL
// SYMBOL INFO
// SYMBOL STATS

import type { ChartEngine } from "../core/chartEngine";

export function _updateOHLCVlegend(engine: ChartEngine, d: any, i: number) {
  const bull = d.close >= d.open;
  const chg = d.close - d.open;
  const pct = ((chg / d.open) * 100).toFixed(2);
  const col = bull ? "var(--bull)" : "var(--bear)";

  let ohlcContainer = engine.legendDiv.querySelector<HTMLDivElement>(
    "#chart-legend-content",
  );

  const content =
    `<span class="chart-legend-item"><span class="chart-legend-label">Bitcoin / Tether USD · SPOT · CRYPTO</span></span>` +
    `<span class="chart-legend-item"><span class="chart-legend-label">O</span><span class="chart-legend-val">${d.open.toFixed(2)}</span></span>` +
    `<span class="chart-legend-item"><span class="chart-legend-label">H</span><span class="chart-legend-val">${d.high.toFixed(2)}</span></span>` +
    `<span class="chart-legend-item"><span class="chart-legend-label">L</span><span class="chart-legend-val">${d.low.toFixed(2)}</span></span>` +
    `<span class="chart-legend-item"><span class="chart-legend-label">C</span><span class="chart-legend-val" style="color:${col}">${d.close.toFixed(2)}</span></span>` +
    `<span class="chart-legend-item"><span class="chart-legend-label">V</span><span class="chart-legend-val">${d.volume.toFixed(2)}</span></span>` +
    `<span class="chart-legend-item"><span class="chart-legend-label">T</span><span class="chart-legend-val">${d.time}</span></span>` +
    `<span class="chart-legend-item" style="color:${col}">${bull ? "+" : ""}${chg.toFixed(2)} (${bull ? "+" : ""}${pct}%)</span>`;

  if (!ohlcContainer) {
    ohlcContainer = document.createElement("div");
    ohlcContainer.id = "chart-legend-content";
    engine.legendDiv.appendChild(ohlcContainer);
  }

  ohlcContainer.innerHTML = content;
}