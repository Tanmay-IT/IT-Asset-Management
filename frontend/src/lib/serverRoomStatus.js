/**
 * Source status text is inconsistent ("ACTIVE", "Not Active", "NOT ACTIVE",
 * "ACTIVE - MAYBE"...). This only decides a *display color* — the stored
 * value is never rewritten. Case/whitespace variants of the same status
 * collapse; genuinely different text (e.g. the "- MAYBE" qualifier) doesn't.
 */
export function classifyServerRoomStatus(status) {
  const normalized = (status || '').trim().toUpperCase();
  if (!normalized) return 'unknown';
  if (normalized.includes('NOT ACTIVE') || normalized.includes('INACTIVE')) return 'inactive';
  if (normalized.includes('ACTIVE')) return 'active';
  return 'unknown';
}

export function getServerRoomStatusColor(status) {
  const state = classifyServerRoomStatus(status);
  if (state === 'active') return 'green';
  if (state === 'inactive') return 'orange';
  return 'gray';
}
