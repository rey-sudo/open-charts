export function _updateStatusBar() {
  this.statusBarsEl.textContent = `${this._barsVisible()} bars`;
  this.statusZoomEl.textContent = `×${this.barWidth.toFixed(1)}`;
}
