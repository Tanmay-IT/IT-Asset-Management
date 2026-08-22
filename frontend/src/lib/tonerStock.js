// Source data mixes real quantities with free text (e.g. "1 used in HO
// printer"), so qtyDelivered is stored as a string — this reads the leading
// number out of it rather than assuming every value is a clean integer.
function parseLeadingNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/^\s*(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

/**
 * currentStock = total inward - total outward, per toner type. There is no
 * source-defined "reorder threshold" — `lowStockThreshold` is a UI-level
 * judgment call (defaults to 2, the most common single restock batch size
 * seen in the data), never a source value.
 */
export function computeTonerStock(inwardRows, outwardRows, lowStockThreshold = 2) {
  const byType = new Map();

  for (const row of inwardRows) {
    const type = (row.tonerType || '').trim();
    if (!type) continue;
    const key = type.toUpperCase();
    const entry = byType.get(key) || { tonerType: type, inward: 0, outward: 0 };
    entry.inward += row.inwardQty || 0;
    byType.set(key, entry);
  }

  for (const row of outwardRows) {
    const type = (row.tonerType || '').trim();
    if (!type) continue;
    const key = type.toUpperCase();
    const entry = byType.get(key) || { tonerType: type, inward: 0, outward: 0 };
    entry.outward += parseLeadingNumber(row.qtyDelivered);
    byType.set(key, entry);
  }

  return [...byType.values()]
    .map((entry) => ({
      ...entry,
      currentStock: entry.inward - entry.outward,
      isLow: entry.inward - entry.outward <= lowStockThreshold,
    }))
    .sort((a, b) => a.tonerType.localeCompare(b.tonerType));
}
