import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { TonerInward } from '../src/models/tonerInward.model.js';
import { TonerOutward } from '../src/models/tonerOutward.model.js';
import { TONER_INWARD_SEED, TONER_OUTWARD_SEED } from '../src/data/tonerSeedData.js';

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  // Only ever touch historical (imported) records — never a user's own
  // manually-added inward/outward entries.
  await TonerInward.deleteMany({ isHistorical: true });
  await TonerOutward.deleteMany({ isHistorical: true });

  const inward = await TonerInward.insertMany(TONER_INWARD_SEED.map((row) => ({ ...row, isHistorical: true })));
  const outward = await TonerOutward.insertMany(TONER_OUTWARD_SEED.map((row) => ({ ...row, isHistorical: true })));

  console.log(`Seeded ${inward.length} toner inward entries and ${outward.length} toner outward entries.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Toner seed failed:', err);
  process.exit(1);
});
