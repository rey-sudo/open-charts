/**
 * Builds and injects the chart DOM structure into the container.
 *
 * The layout includes:
 * - Main chart pane and rendering canvases
 * - Time axis
 * - Horizontal scrollbar
 * - Legend and indicators containers
 * - Debug/status bar
 *
 * Returns `true` when the layout is successfully created.
 */
export function _buildLayout() {
  const chartArea = this.area;

  // Create the complete chart DOM structure.
  chartArea.innerHTML = `
    <div class="pane" id="pane-main">
      <canvas class="chart-canvas" id="canvas-main"></canvas>
      <canvas class="drawings-canvas" id="canvas-drawings"></canvas>
      <canvas class="pricescale-canvas" id="canvas-pricescale"></canvas>
      <canvas class="overlay-canvas" id="canvas-overlay"></canvas>
    </div>

    <div id="time-axis">
      <canvas class="time-canvas" id="canvas-time"></canvas>
    </div>

    <div id="scrollbar">
      <div id="scrollthumb"></div>
    </div>

    <div id="chart-legend"></div>
    <div id="chart-indicators"></div>

    <div id="statusbar">
      <span id="status-fps">60 FPS</span>
      <span id="status-bars"></span>
      <span id="status-zoom"></span>
      <span id="status-cursor"></span>
    </div>
  `;

  return true;
}
