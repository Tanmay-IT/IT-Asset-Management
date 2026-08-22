// Shared by the one-time seed (scripts/seedHdd.js) and live edits
// (services/hdd.service.js) so both apply identical, deterministic
// normalization — never a guess, and never a change to the original value.

const CAPACITY_UNITS = [
  { token: 'TB', multiplier: 1024 },
  { token: 'GB', multiplier: 1 },
  { token: 'MB', multiplier: 1 / 1024 },
];

export function normalizeCapacity(raw) {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  const match = upper.match(/([\d.]+)\s*(TB|GB|MB)/);
  if (!match) return null;
  const unit = CAPACITY_UNITS.find((u) => u.token === match[2]);
  const value = Number(match[1]);
  if (!unit || Number.isNaN(value)) return null;
  return Math.round(value * unit.multiplier * 100) / 100;
}

// Only accepts strict YYYY-MM-DD — every other format is intentionally left
// unnormalized rather than guessed at.
export function normalizeDate(raw) {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function computeMainVerificationFlags(record) {
  const flags = [];
  if (!record.serialNumber) flags.push('Missing serial number');
  if (!record.date) flags.push('Missing allocation date');
  return flags;
}
