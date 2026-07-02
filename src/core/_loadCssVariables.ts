import type { ChartEngine } from "../core/chartEngine";

/**
 * Applies configured values as CSS custom properties
 * on the document root element.
 */
export function _loadCssVariables(engine: ChartEngine): void {
  const root = document.documentElement;

  // Colors
  if (engine.options.colors) {
    Object.entries(engine.options.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }

  // Typography
  const { fontSizeLarge, fontSizeNormal, fontSizeSmall, fontFamily } = engine.options;

    if (fontSizeLarge) {
    root.style.setProperty("--fontSizeLarge", fontSizeLarge);
  }

  if (fontSizeNormal) {
    root.style.setProperty("--fontSizeNormal", fontSizeNormal);
  }

  if (fontSizeSmall) {
    root.style.setProperty("--fontSizeSmall", fontSizeSmall);
  }

  if (fontFamily) {
    root.style.setProperty("--fontFamily", fontFamily);
  }
}