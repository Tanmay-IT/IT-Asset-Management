import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { HddMainRecord } from './models/hddMainRecord.model.js';
import { TonerInward } from './models/tonerInward.model.js';
import { seedHddData } from './seed/seedHddData.js';
import { seedTonerData } from './seed/seedTonerData.js';

const port = process.env.PORT || 5000;

// First-boot bootstrap only (skipped once historical data already exists) —
// safe to run against a brand-new empty database (e.g. a freshly created
// Atlas cluster) without needing shell/CLI access to it. Re-run
// `node scripts/seedHdd.js` / `seedToners.js` manually if the seed data
// itself is intentionally updated later.
async function bootstrapSeedData() {
  if ((await HddMainRecord.countDocuments({ isHistorical: true })) === 0) {
    const { mainCount, detailCount } = await seedHddData();
    console.log(`HDD Archive bootstrap: seeded ${mainCount} Main records and ${detailCount} detail sheets.`);
  }
  if ((await TonerInward.countDocuments({ isHistorical: true })) === 0) {
    const { inwardCount, outwardCount } = await seedTonerData();
    console.log(`Toner log bootstrap: seeded ${inwardCount} inward and ${outwardCount} outward entries.`);
  }
}

async function main() {
  await connectDB(process.env.MONGODB_URI);
  await bootstrapSeedData();

  const app = createApp();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
