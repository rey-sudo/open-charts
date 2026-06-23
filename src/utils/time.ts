export function _tsToDate(t: any) {
  return new Date(t * 1000);
}

export function _formatDate(t: any, step: any) {
  const d = _tsToDate(t);
  const mo = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yr = String(d.getUTCFullYear()).slice(2);

  if (step === "minute") return `${hh}:${mm}`;
  if (step === "hour") return `${hh}:00`;
  if (step === "day") return `${mo[d.getUTCMonth()]} ${dd}`;
  if (step === "week") return `${mo[d.getUTCMonth()]} ${dd}`;
  if (step === "month") return `${mo[d.getUTCMonth()]} ${yr}`;
  if (step === "quarter")
    return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${yr}`;
  return `${d.getUTCFullYear()}`;
}

export function _formatDateFull(t: any, interval: any) {
  const d = _tsToDate(t);
  const mo = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = `${mo[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");

  if (interval < 60) return `${date} ${hh}:${mm}:${ss}`; // sub-minuto
  if (interval < 86400) return `${date} ${hh}:${mm}`; // intraday
  return date; // daily+
}
