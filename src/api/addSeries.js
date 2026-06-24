import { _updateLegend } from "../ui/_updateLegend";

export function addSeries(def) {
  const params = {};
  if (def.params) {
    for (const [k, field] of Object.entries(def.params)) {
      params[k] = { ...field }; // copy value, type, label, etc.
    }
  }

  const entry = { def, values: [], enabled: true, params };
  if (this.data.length) entry.values = def.compute(this.data);
  this._series.set(def.id, entry);
  _updateLegend.call(this);
  return this; // chainable
}
