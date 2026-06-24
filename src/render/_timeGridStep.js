export function _timeGridStep() {
  const span = this._barsVisible() * this.interval; // segundos cubiertos
  if (span <= 2 * 3600) return "minute"; // ≤ 2h   → grid cada minuto
  if (span <= 48 * 3600) return "hour"; // ≤ 2d   → grid cada hora
  if (span <= 8 * 86400) return "day"; // ≤ 8d   → grid cada día
  if (span <= 60 * 86400) return "week"; // ≤ 2m   → grid cada semana
  if (span <= 365 * 86400) return "month"; // ≤ 1a   → grid cada mes
  if (span <= 1460 * 86400) return "quarter"; // ≤ 4a   → grid cada trimestre
  return "year";
}
