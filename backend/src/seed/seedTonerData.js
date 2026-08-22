import { TonerInward } from '../models/tonerInward.model.js';
import { TonerOutward } from '../models/tonerOutward.model.js';
import { TONER_INWARD_SEED, TONER_OUTWARD_SEED } from '../data/tonerSeedData.js';

/**
 * Seeds the Toner inward/outward historical data. Safe to call on every
 * server startup — only ever deletes/reinserts `isHistorical: true`
 * documents, never a user's own manually-added or imported entries.
 */
export async function seedTonerData() {
  await TonerInward.deleteMany({ isHistorical: true });
  await TonerOutward.deleteMany({ isHistorical: true });

  const inward = await TonerInward.insertMany(TONER_INWARD_SEED.map((row) => ({ ...row, isHistorical: true })));
  const outward = await TonerOutward.insertMany(TONER_OUTWARD_SEED.map((row) => ({ ...row, isHistorical: true })));

  return { inwardCount: inward.length, outwardCount: outward.length };
}
