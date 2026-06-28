import type { ChartEngine } from "./chartEngine";

export function _visiblePriceRange(engine: ChartEngine) {
  const data = engine.data;

  if (!data?.length) {
    return { lo: 0, hi: 1 };
  }

  let lo = Infinity;
  let hi = -Infinity;

  const vs = Math.max(0, engine.viewStart);
  const ve =
    engine.viewEnd === 0 ? data.length : Math.min(data.length, engine.viewEnd);

  for (let i = vs; i < ve; i++) {
    const bar: any = data[i];
    if (!bar) continue;

    lo = Math.min(lo, bar.low);
    hi = Math.max(hi, bar.high);
  }

  // Let enabled series extend the visible price range
  engine._series.forEach(({ def, values, enabled }) => {
    /*
    if (!enabled || !def?.priceExtent) return;
    const ext = def.priceExtent(values, vs, ve);
    if (ext) {
      lo = Math.min(lo, ext[0]);
      hi = Math.max(hi, ext[1]);
    }
    */
  });

  // No se encontró ningún dato válido
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { lo: 0, hi: 1 };
  }

  // Si todos los precios son iguales, añade un padding mínimo
  const range = hi - lo;
  const pad = range > 0 ? range * 0.06 : Math.max(Math.abs(lo) * 0.01, 1);

  return {
    lo: lo - pad,
    hi: hi + pad,
  };
}
