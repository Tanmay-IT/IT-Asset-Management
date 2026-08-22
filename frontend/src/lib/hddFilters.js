/**
 * Filter helpers for the HDD inventory. These never alter a record's
 * displayed/stored value — grouping only affects which filter bucket a row
 * falls into.
 *
 * Brand is grouped case/whitespace-insensitively (the same convention the
 * backend dashboard stats already use for "Backup Drive") because casing
 * variance there is unambiguously cosmetic (SEAGATE / Seagate / seagate are
 * the same brand). Capacity is matched as an exact original string — a
 * format difference like "1TB" vs "1TB SATA" can carry real meaning
 * (interface type), so it is never merged.
 */
function normalizeForGrouping(value) {
  return (value || '').trim().toLowerCase();
}

export function getEntityBrand(entity) {
  return entity.main?.brand || entity.detail?.brand || '';
}

export function getEntityCapacity(entity) {
  return entity.main?.capacity || entity.detail?.capacity || '';
}

export function buildBrandOptions(entities) {
  const byKey = new Map();
  for (const entity of entities) {
    const raw = getEntityBrand(entity).trim();
    if (!raw) continue;
    const key = normalizeForGrouping(raw);
    if (!byKey.has(key)) byKey.set(key, raw);
  }
  return [...byKey.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

export function buildCapacityOptions(entities) {
  const values = new Set();
  for (const entity of entities) {
    const raw = getEntityCapacity(entity).trim();
    if (raw) values.add(raw);
  }
  return [...values].sort();
}

export function matchesBrand(entity, brandKey) {
  if (!brandKey) return true;
  return normalizeForGrouping(getEntityBrand(entity)) === brandKey;
}

export function matchesCapacity(entity, capacityValue) {
  if (!capacityValue) return true;
  return getEntityCapacity(entity).trim() === capacityValue;
}

/** All / Has Detailed Data / Inventory Only — covers "record type" and "drive data availability" at once (see CLAUDE.md note). */
export function matchesDataAvailability(entity, filter) {
  if (filter === 'All' || !filter) return true;
  const hasDetailedData = Boolean(entity.detail && entity.detail.hasData !== false);
  if (filter === 'Has Detailed Data') return hasDetailedData;
  if (filter === 'Inventory Only') return !entity.detail;
  return true;
}

export function matchesVerification(entity, filter) {
  if (filter === 'All' || !filter) return true;
  const needsVerification =
    Boolean(entity.main?.verificationFlags?.length) ||
    (entity.detail && entity.detail.matchConfidence !== 'confirmed');
  if (filter === 'Needs Verification') return needsVerification;
  if (filter === 'No Issues') return !needsVerification;
  return true;
}
