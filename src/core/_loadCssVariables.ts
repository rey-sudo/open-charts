import type { ChartEngine } from "../core/chartEngine";

/**
 * Applies configured color values as CSS custom properties
 * on the document root element.
 */
export function _loadCssVariables(engine: ChartEngine) {
  const root = document.documentElement;

  if (engine.options.colors) {
    Object.entries(engine.options.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
}
