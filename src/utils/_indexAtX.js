/**
 * Converts a horizontal pixel position within the chart
 * into the corresponding data index based on current zoom
 * (bar width) and viewport offset.
 */
export function _indexAtX(x) {
  return Math.round((x - this.barWidth / 2) / this.barWidth) + this.viewStart;
}
