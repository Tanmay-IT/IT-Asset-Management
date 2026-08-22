/**
 * Derived UI status only — never the source value. See CLAUDE.md's HDD
 * Archive section: SOURCE VALUE vs DERIVED UI STATUS must stay distinct.
 */
export function getHddStatus({ detail }) {
  if (!detail) return { label: 'Inventory Only', color: 'gray' };
  if (detail.hasData === false) return { label: 'Detail Sheet Empty', color: 'gray' };
  if (detail.matchConfidence === 'confirmed') return { label: 'Detailed Record Available', color: 'green' };
  if (detail.matchConfidence === 'discrepancy') return { label: 'Needs Verification', color: 'amber' };
  return { label: 'Unmatched Detail Sheet', color: 'amber' };
}

export function getRecordId({ main, detail }) {
  if (main) return { kind: 'main', id: main._id };
  if (detail) return { kind: 'detail', id: detail._id };
  return null;
}

/** Coarser grouping used for the Inventory page's status filter chips. */
export function getFilterBucket({ main, detail }) {
  if (!detail) return 'Inventory Only';
  const cleanMatch = detail.hasData !== false && detail.matchConfidence === 'confirmed';
  const mainHasFlags = Boolean(main?.verificationFlags?.length);
  if (cleanMatch && !mainHasFlags) return 'Detailed Record Available';
  return 'Needs Verification';
}
