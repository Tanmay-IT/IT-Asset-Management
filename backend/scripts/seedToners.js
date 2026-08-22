import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { seedTonerData } from '../src/seed/seedTonerData.js';

async function run() {
  await connectDB(process.env.MONGODB_URI);
  const { inwardCount, outwardCount } = await seedTonerData();
  console.log(`Seeded ${inwardCount} toner inward entries and ${outwardCount} toner outward entries.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Toner seed failed:', err);
  process.exit(1);
});
