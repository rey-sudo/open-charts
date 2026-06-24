// Recompute values for all registered series (called on full load)
export function _recomputeSeries() {
  this._series.forEach((entry) => {
    entry.values = entry.def.compute(this.data, entry.params);
  });
}
