import { parseLooseDate } from './parseLooseDate';

const EXPIRING_SOON_WINDOW_DAYS = 30;

/**
 * Derived purely from `warrantyDate` for display (e.g. "Expires in 12 days")
 * — never overwrites or replaces the source `status` field, and returns null
 * when the date doesn't parse rather than guessing.
 */
export function getWarrantyExpiry(warrantyDate) {
  const date = parseLooseDate(warrantyDate);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { state: 'expired', color: 'red', label: `Expired ${Math.abs(diffDays)}d ago` };
  }
  if (diffDays <= EXPIRING_SOON_WINDOW_DAYS) {
    return { state: 'expiring', color: 'amber', label: diffDays === 0 ? 'Expires today' : `Expires in ${diffDays}d` };
  }
  return { state: 'active', color: 'green', label: 'In warranty' };
}
