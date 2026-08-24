const BOOLEAN_VALUES = new Set(['yes', 'no', 'y', 'n', 'true', 'false']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

/**
 * Infers a lightweight display/edit type per column from the values already
 * present across a module's records — used only to pick a nicer input/render
 * (number field, Yes/No select, clickable link) than a plain text box. Never
 * changes what's stored: the underlying value is always the original string.
 */
function detectType(values) {
  const nonEmpty = values.map((v) => (v ?? '').toString().trim()).filter(Boolean);
  if (nonEmpty.length === 0) return 'text';

  if (nonEmpty.every((v) => BOOLEAN_VALUES.has(v.toLowerCase()))) return 'boolean';
  if (nonEmpty.every((v) => v !== '' && !Number.isNaN(Number(v)))) return 'number';
  if (nonEmpty.every((v) => EMAIL_PATTERN.test(v))) return 'email';
  if (nonEmpty.every((v) => URL_PATTERN.test(v))) return 'url';
  return 'text';
}

/** columns: [{key,label}], records: [{data:{...}}] -> { [key]: 'number'|'boolean'|'email'|'url'|'text' } */
export function detectColumnTypes(columns, records) {
  const types = {};
  for (const col of columns) {
    types[col.key] = detectType(records.map((r) => r.data?.[col.key]));
  }
  return types;
}

export function formatBoolean(value) {
  const normalized = (value || '').toString().trim().toLowerCase();
  return normalized === 'yes' || normalized === 'y' || normalized === 'true';
}
