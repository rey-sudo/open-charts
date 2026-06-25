import type { ChartEngine } from "../core/chartEngine";

/**
 * Applies configured color values as CSS custom properties
 * on the document root element.
 */
export function _loadCssVariables(this: ChartEngine): boolean {
  const root = document.documentElement;

  if (this.options.colors) {
    Object.entries(this.options.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }

  return true;
}
