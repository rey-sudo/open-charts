import {
  PRICE_SCALE_W,
  DEFAULT_OPTIONS,
  DEFAULT_BAR_W,
  SCROLL_ZOOM_FACTOR,
  MIN_BAR_W,
  MAX_BAR_W,
} from "../core/config";
import { _clampView } from "../core/_clampView";
import { _updateScrollThumb } from "../ui/_updateScrollThumb";
import { _updateStatusBar } from "../ui/_updateStatusBar";

/**
 * Registers all user interaction and lifecycle event handlers
 * required by the chart, including mouse, touch, scrolling,
 * zooming, panning, scrollbar dragging, and window resizing.
 */
export function _bindEvents() {
  const area = this.area;

  // Track mouse movement within the chart area.
  area.addEventListener(
    "mousemove",
    (e) => {
      // Update the current mouse position and mark it as inside the chart.
      this.mouse = { x: e.clientX, y: e.clientY, inside: true };

      // Handle horizontal panning while dragging.
      if (this.isPanning) {
        // Calculate the horizontal drag distance from the pan start point.
        const dx = e.clientX - this.panOrigin.x;

        // Calculate how many bars to shift based on the horizontal pixel movement.
        const shift = -Math.round(dx / this.barWidth);

        // Calculate how many bars fit in the current viewport.
        const capacity = Math.floor(this.chartW / this.barWidth);

        // Determine the maximum valid start index for the viewport.
        const maxStart = Math.max(
          0,
          this.data.length + this.rightPadBars - capacity,
        );

        // Update and clamp the viewport start index.
        this.viewStart = Math.max(
          0,
          Math.min(maxStart, this.panOrigin.viewStart + shift),
        );

        // Recalculate the viewport end index.
        this.viewEnd = this.viewStart + capacity;

        // Ensure the visible range remains within valid bounds.
        _clampView.call(this);

        // Mark the main chart layer for redraw.
        this.dirty = true;

        // Synchronize the scrollbar thumb with the new viewport.
        _updateScrollThumb.call(this);

        // Refresh status information displayed to the user.
        _updateStatusBar.call(this);
      }

      // Mark the overlay layer for redraw.
      this.overlayDirty = true;
    },
    { signal: this._abortController.signal },
  );

  // Handle pointer exit from the chart area.
  area.addEventListener(
    "mouseleave",
    () => {
      // Mark the mouse as outside the chart bounds.
      this.mouse.inside = false;

      // Redraw overlay elements affected by hover state.
      this.overlayDirty = true;
    },
    { signal: this._abortController.signal },
  );

  // Restore hover state when the pointer enters the chart area.
  area.addEventListener(
    "mouseenter",
    () => {
      this.mouse.inside = true;
    },
    { signal: this._abortController.signal },
  );

  // Start a horizontal pan operation when the chart is clicked and dragged.
  area.addEventListener(
    "mousedown",
    (e) => {
      // Ignore panning if another tool or interaction has claimed the pointer.
      if (this._pointerClaimed) return;

      if (e.button !== 0) return;

      // Mark the chart as being actively panned.
      this.isPanning = true;

      // Store the initial pointer position and viewport state for panning calculations.
      this.panOrigin = { x: e.clientX, viewStart: this.viewStart };

      // Update the cursor to indicate an active drag operation.
      area.style.cursor = "grabbing";
    },
    { signal: this._abortController.signal },
  );

  // End the current pan operation when the mouse button is released.
  window.addEventListener(
    "mouseup",
    (e) => {
      if (this.isPanning) {
        this.isPanning = false;
        area.style.cursor = "";
      }
    },
    { signal: this._abortController.signal },
  );

  // Handle mouse wheel zoom interaction on the chart area.
  area.addEventListener(
    "wheel",
    (e) => {
      // Prevent default page scrolling behavior.
      e.preventDefault();

      // Determine zoom direction based on wheel movement.
      const delta = e.deltaY > 0 ? -1 : 1;

      // Compute zoom factor applied to current bar width.
      const factor = 1 + delta * SCROLL_ZOOM_FACTOR;

      // Compute the new bar width, clamped to allowed zoom limits.
      const newBarW = Math.max(
        MIN_BAR_W,
        Math.min(MAX_BAR_W, this.barWidth * factor),
      );

      // If zoom does not change bar width, exit early.
      if (newBarW === this.barWidth) return;

      // Get mouse position relative to the chart content area.
      const localX = e.clientX - this.panes.main.x;

      // Identify the bar index under the cursor (zoom focus point).
      const focusIdx = this._indexAtX(localX);

      // Apply the new zoom level.
      this.barWidth = newBarW;

      // Recalculate how many bars fit in the viewport.
      const capacity = Math.floor(this.chartW / this.barWidth);

      // Compute cursor position as a ratio of chart width.
      const rel = localX / this.chartW;

      // Adjust viewport so the focused bar stays under the cursor.
      this.viewStart = Math.max(0, Math.round(focusIdx - rel * capacity));

      // Recalculate viewport end based on new capacity.
      this.viewEnd = this.viewStart + capacity;

      // Clamp viewport to valid data bounds.
      _clampView.call(this);

      // Mark chart for redraw.
      this.dirty = true;

      // Sync scrollbar thumb with new viewport.
      _updateScrollThumb.call(this);

      // Update UI status indicators.
      _updateStatusBar.call(this);
    },
    { passive: false, signal: this._abortController.signal },
  );

  // Initialize touch tracking state for mobile interactions (pan and pinch zoom).
  let lastTouches = [];

  // Store initial touch points when the user starts touching the chart.
  area.addEventListener(
    "touchstart",
    (e) => {
      // Copy current touch points so we can compare movement in touchmove.
      lastTouches = [...e.touches];
    },
    // Allow the browser to handle default behaviors (no preventDefault here).
    { passive: true, signal: this._abortController.signal },
  );

  // Handle touch movement for mobile pan (1 finger) and pinch zoom (2 fingers).
  area.addEventListener(
    "touchmove",
    (e) => {
      // Prevent default browser behavior (scroll/zoom page).
      e.preventDefault();

      // SINGLE TOUCH: horizontal pan gesture.
      if (e.touches.length === 1 && lastTouches.length === 1) {
        // Compute horizontal movement since last frame (in pixels).
        const dx = e.touches[0].clientX - lastTouches[0].clientX;

        // Convert pixel movement into bar index shift.
        const shift = -Math.round(dx / this.barWidth);

        // Compute how many bars fit in the visible chart area.
        const capacity = Math.floor(this.chartW / this.barWidth);

        // Compute the maximum valid starting index (right boundary constraint).
        const maxStart = Math.max(
          0,
          this.data.length + this.rightPadBars - capacity,
        );

        // Update viewport start index with clamping to valid range.
        this.viewStart = Math.max(
          0,
          Math.min(maxStart, this.viewStart + shift),
        );

        // Recompute viewport end index based on capacity.
        this.viewEnd = this.viewStart + capacity;

        // Ensure viewport stays within valid data bounds.
        _clampView.call(this);

        // Mark chart for redraw.
        this.dirty = true;

        // Update scrollbar thumb position.
        _updateScrollThumb.call(this);
      }

      // TWO FINGERS: pinch zoom — reemplazar este bloque
      else if (e.touches.length === 2 && lastTouches.length === 2) {
        const prev = Math.hypot(
          lastTouches[0].clientX - lastTouches[1].clientX,
          lastTouches[0].clientY - lastTouches[1].clientY,
        );
        const curr = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const scale = curr / prev;

        this.barWidth = Math.max(
          MIN_BAR_W,
          Math.min(MAX_BAR_W, this.barWidth * scale),
        );

        const capacity = Math.floor(this.chartW / this.barWidth);
        this.viewEnd = this.viewStart + capacity; // <- antes: Math.min(this.data.length, ...)
        _clampView.call(this);

        this.dirty = true;
        _updateScrollThumb.call(this);
      }

      // Update last known touch positions for next move event.
      lastTouches = [...e.touches];
    },
    // Enable preventDefault because we block native touch scrolling.
    { passive: false, signal: this._abortController.signal },
  );

  // Cache references to the scrollbar thumb and track elements.
  const thumb = this.scrollThumbEl;
  const scrollbar = this.scrollbarEl;

  // Track scrollbar drag state and drag origin information.
  let scrollDragging = false,
    scrollOriginX = 0,
    scrollOriginVS = 0;

  // Begin scrollbar dragging when the thumb is pressed.
  thumb.addEventListener(
    "mousedown",
    (e) => {
      // Enable scrollbar drag mode.
      scrollDragging = true;
      // Store the initial mouse X position.
      scrollOriginX = e.clientX;
      // Store the viewport start index at drag start.
      scrollOriginVS = this.viewStart;
      // Prevent the event from triggering chart panning.
      e.stopPropagation();
    },
    { signal: this._abortController.signal },
  );

  // Handle thumb dragging while the mouse moves.
  window.addEventListener(
    "mousemove",
    (e) => {
      // Ignore movement unless a scrollbar drag is active.
      if (!scrollDragging) return;

      // Get the current scrollbar track width.
      const scrollbarWidth = scrollbar.offsetWidth;

      // Compute the total scrollable range, including right padding.
      const total = this.data.length + this.rightPadBars;

      // Convert horizontal mouse movement into a scrollbar ratio.
      const ratio = (e.clientX - scrollOriginX) / scrollbarWidth;

      // Convert scrollbar movement into a bar index offset.
      const shift = Math.round(ratio * total);

      // Calculate how many bars fit in the current viewport.
      const capacity = Math.floor(this.chartW / this.barWidth);

      // Update and clamp the viewport start index.
      this.viewStart = Math.max(
        0,
        Math.min(
          this.data.length + this.rightPadBars - capacity,
          scrollOriginVS + shift,
        ),
      );

      // Recalculate the viewport end index.
      this.viewEnd = Math.min(
        this.data.length + this.rightPadBars,
        this.viewStart + capacity,
      );

      // Ensure the viewport remains within valid bounds.
      _clampView.call(this);

      // Mark the chart for redraw.
      this.dirty = true;

      // Synchronize the scrollbar thumb position and size.
      _updateScrollThumb.call(this);

      // Refresh viewport-related status information.
      _updateStatusBar.call(this);
    },
    { signal: this._abortController.signal },
  );

  // End scrollbar dragging when the mouse button is released.
  window.addEventListener(
    "mouseup",
    () => {
      scrollDragging = false;
    },
    { signal: this._abortController.signal },
  );

  // Recalculate chart layout when the browser window is resized.
  window.addEventListener(
    "resize",
    () => {
      _resize.call(this);
      this.dirty = true;
    },
    { signal: this._abortController.signal },
  );
}
