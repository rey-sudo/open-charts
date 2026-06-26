import { _mergeoptions } from "../utils/_mergeOptions";
import { _loadCssVariables } from "../core/_loadCssVariables";

export function applyOptions(newOptions) {
  this.options = _mergeoptions(this.options, newOptions);
  _loadCssVariables(this);
  this.dirty = true;
}
