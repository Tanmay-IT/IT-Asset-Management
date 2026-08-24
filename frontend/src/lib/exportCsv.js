/**
 * Plain CSV export — no client-side xlsx-writing library needed (real .xlsx
 * generation would mean a new dependency + bundle weight for something
 * Excel already opens natively as CSV).
 */
function csvEscape(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** fields: [{ key, label, value?: (row) => string }] */
export function exportToCsv(filename, rows, fields) {
  const header = fields.map((f) => csvEscape(f.label)).join(',');
  const lines = rows.map((row) =>
    fields.map((f) => csvEscape(f.value ? f.value(row) : row[f.key])).join(',')
  );
  const csv = [header, ...lines].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
