import { _mergeoptions } from "../utils/_mergeOptions";
import { _loadCssVariables } from "../render/theme";

export function applyOptions(newOptions) {
  this.options = _mergeoptions(this.options, newOptions);
  _loadCssVariables(this.options);
  this.dirty = true;
}
