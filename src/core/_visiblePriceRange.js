export function _visiblePriceRange() {
  let lo = Infinity,
    hi = -Infinity;
  const vs = Math.max(0, this.viewStart);
  const ve = Math.min(this.data.length, this.viewEnd);
  for (let i = vs; i < ve; i++) {
    if (this.data[i].l < lo) lo = this.data[i].l;
    if (this.data[i].h > hi) hi = this.data[i].h;
  }
  // Let enabled series extend the visible price range (e.g. BB bands)
  this._series.forEach(({ def, values, enabled }) => {
    if (!enabled || !def.priceExtent) return;
    const ext = def.priceExtent(values, vs, ve);
    if (ext) {
      lo = Math.min(lo, ext[0]);
      hi = Math.max(hi, ext[1]);
    }
  });
  // Add padding
  const pad = (hi - lo) * 0.06;
  return { lo: lo - pad, hi: hi + pad };
}
