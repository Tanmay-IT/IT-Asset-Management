import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';

const SALT_ROUNDS = 10;

/**
 * First-boot bootstrap, same pattern as HDD/Toner seeding: only runs when
 * the User collection is empty, so it's safe to leave in server.js
 * permanently — it will never overwrite a real admin account.
 */
export async function bootstrapAdminUser() {
  if ((await User.countDocuments()) > 0) return null;
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) {
    console.warn('No users exist and ADMIN_EMAIL/ADMIN_PASSWORD are not set — skipping admin bootstrap.');
    return null;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return User.create({ email, passwordHash, name: 'Admin' });
}

export async function verifyCredentials(email, password) {
  const user = await User.findOne({ email: (email || '').trim().toLowerCase() });
  if (!user) return null;
  const isMatch = await bcrypt.compare(password || '', user.passwordHash);
  return isMatch ? user : null;
}

export function findUserById(id) {
  return User.findById(id);
}
