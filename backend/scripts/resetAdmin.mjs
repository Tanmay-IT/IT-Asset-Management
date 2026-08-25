import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';

await connectDB(process.env.MONGODB_URI);
const result = await User.deleteMany({});
console.log(`Removed ${result.deletedCount} user(s). Restart the server to re-bootstrap the admin account.`);
await mongoose.disconnect();
