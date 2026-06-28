import {
  PRICE_SCALE_W,
  DEFAULT_OPTIONS,
  DEFAULT_BAR_W,
  SCROLL_ZOOM_FACTOR,
  MIN_BAR_W,
  MAX_BAR_W,
} from "../core/config";
import { _updateScrollThumb } from "../timeScale/_updateScrollThumb";
import { _updateStatusBar } from "../ui/_updateStatusBar";

export function resetZoom() {
  this.barWidth = DEFAULT_BAR_W;
  const capacity = Math.floor(this.chartW / this.barWidth);
  this.viewEnd = this.data.length + this.rightPadBars;
  this.viewStart = Math.max(0, this.viewEnd - capacity);
  this.dirty = true;
  _updateScrollThumb.call(this);
  _updateStatusBar.call(this);
}
