export function destroy() {
  this._running = false;

  if (this._rafId) cancelAnimationFrame(this._rafId);

  this._abortController.abort();

  this._drawingModules.forEach((handle) => handle.destroy());
  this._drawingModules.clear();

  if (this.area) this.area.innerHTML = "";
}
