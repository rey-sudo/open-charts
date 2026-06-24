// Compare two integer-second timestamps at day granularity.
// For intraday bars change 86400 to the bar interval in seconds.
export function _isDifferentBar(t1, t2) {
  return Math.floor(t1 / this.interval) !== Math.floor(t2 / this.interval);
}
