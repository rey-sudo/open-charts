export function removeSeries(id) {
  this._series.delete(id);
  this.dirty = true;
  return this;
}
