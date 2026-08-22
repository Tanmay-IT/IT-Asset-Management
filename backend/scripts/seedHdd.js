import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { seedHddData } from '../src/seed/seedHddData.js';

async function run() {
  await connectDB(process.env.MONGODB_URI);
  const { mainCount, detailCount } = await seedHddData();
  console.log(`Seeded ${mainCount} Main records and ${detailCount} detail sheets.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('HDD seed failed:', err);
  process.exit(1);
});
