// Source dates are free-text (dd-mm-yyyy, dd.mm.yyyy, dd/mm/yyyy, and typo'd
// variants) rather than a guaranteed format — this only ever powers a
// transient, client-side display computation (e.g. "recent activity" trend).
// It never writes back or replaces the stored string.
export function parseLooseDate(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/);
  if (!match) return null;
  let [, day, month, year] = match.map(Number);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}
