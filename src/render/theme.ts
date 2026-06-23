import type { ChartOptions } from "../core/config";

/**
 * Applies configured color values as CSS custom properties
 * on the document root element.
 */
export function _loadCssVariables(options: ChartOptions) {
  const root = document.documentElement;

  Object.entries(options.colors).forEach(
    ([key, value]: [string, string]) => {
      root.style.setProperty(`--${key}`, value);
    },
  );
}
