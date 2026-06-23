export function _nicePriceSteps(min: any, max: any, count: any) {
  const range = max - min;
  const rough = range / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const step =
    [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= rough) || mag * 10;
  const start = Math.ceil(min / step) * step;
  const steps = [];
  for (let v = start; v <= max; v += step) steps.push(+v.toFixed(10));
  return steps;
}
