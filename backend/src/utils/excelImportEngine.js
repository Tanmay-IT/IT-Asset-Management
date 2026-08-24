import ExcelJS from 'exceljs';

const TRUE_VALUES = new Set(['y', 'yes', 'true', '1']);
const FALSE_VALUES = new Set(['n', 'no', 'false', '0']);

function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cellValueToString(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join('');
    if (value.text != null) return String(value.text);
    if (value.result != null) return String(value.result);
    return '';
  }
  return String(value).trim();
}

export function parseBoolean(raw, issues, label) {
  const normalized = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  issues.push(`Unrecognized value "${raw}" for ${label} — treated as No`);
  return false;
}

export function parseEnum(raw, allowedValues, issues, label) {
  const match = allowedValues.find((value) => value.toLowerCase() === raw.trim().toLowerCase());
  if (match) return match;
  issues.push(`Unrecognized value "${raw}" for ${label}`);
  return undefined;
}

export function lowercase(raw) {
  return raw.toLowerCase();
}

export function parseNumber(raw, issues, label) {
  const value = Number(raw.trim());
  if (Number.isFinite(value)) return value;
  issues.push(`Unrecognized number "${raw}" for ${label}`);
  return undefined;
}

/**
 * fieldDefinitions: [{ key, label, aliases: string[], transform?: (raw, issues) => value|undefined }]
 * transform defaults to returning the raw trimmed string unchanged.
 */
export async function parseWorkbook(buffer, fieldDefinitions) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('The uploaded file has no worksheets.');
  }

  const aliasLookup = new Map();
  for (const field of fieldDefinitions) {
    for (const alias of field.aliases) {
      aliasLookup.set(alias, field.key);
    }
  }
  const fieldByKey = new Map(fieldDefinitions.map((field) => [field.key, field]));

  const columnFieldMap = new Map();
  const unmappedHeaders = [];

  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const raw = cellValueToString(cell.value);
    if (!raw) return;
    const fieldKey = aliasLookup.get(normalizeHeader(raw));
    if (fieldKey) {
      columnFieldMap.set(colNumber, fieldKey);
    } else {
      unmappedHeaders.push(raw);
    }
  });

  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;

    const data = {};
    const issues = [];
    let hasAnyValue = false;

    for (const [colNumber, fieldKey] of columnFieldMap) {
      const raw = cellValueToString(row.getCell(colNumber).value);
      if (!raw) continue;
      hasAnyValue = true;

      const field = fieldByKey.get(fieldKey);
      const value = field.transform ? field.transform(raw, issues) : raw;
      if (value !== undefined) data[fieldKey] = value;
    }

    if (!hasAnyValue) continue;

    rows.push({
      rowNumber,
      data,
      issues,
      status: issues.length > 0 ? 'warning' : 'ok',
    });
  }

  return { rows, unmappedHeaders: [...new Set(unmappedHeaders)] };
}

function slugifyHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field';
}

/**
 * Like `parseWorkbook`, but for resources with no predefined schema (custom
 * user-defined modules): every header in row 1 becomes a column, keyed by a
 * slugified version of itself, with no transform/validation — every value is
 * kept as the trimmed source string. Column identity is entirely up to the
 * caller (`mergeColumns` on the module) once this returns.
 */
export async function parseWorkbookDynamic(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('The uploaded file has no worksheets.');
  }

  const columnByColNumber = new Map();
  const usedKeys = new Set();

  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const raw = cellValueToString(cell.value);
    if (!raw) return;
    const base = slugifyHeader(raw);
    let key = base;
    let suffix = 2;
    while (usedKeys.has(key)) {
      key = `${base}_${suffix}`;
      suffix += 1;
    }
    usedKeys.add(key);
    columnByColNumber.set(colNumber, { key, label: raw });
  });

  const columns = [...columnByColNumber.values()];
  const rows = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;

    const data = {};
    let hasAnyValue = false;
    for (const [colNumber, col] of columnByColNumber) {
      const raw = cellValueToString(row.getCell(colNumber).value);
      if (!raw) continue;
      hasAnyValue = true;
      data[col.key] = raw;
    }
    if (!hasAnyValue) continue;

    rows.push({ rowNumber, data, issues: [], status: 'ok' });
  }

  return { rows, columns };
}
