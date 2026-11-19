/**
 * ZIMOR — Secure Administrator Private Provisioning Utility
 * 
 * Provisions or updates credentials for the EXACT two authorized administrator accounts:
 * - karunsingh1602@gmail.com
 * - zimorindia@gmail.com
 * 
 * Strictly prohibits any email outside the allowlist.
 * Uses bcrypt (12 rounds) for password hashing.
 * 
 * Usage:
 *   npx tsx scripts/provision-admins.ts --status
 *   npx tsx scripts/provision-admins.ts <email> <password> [name]
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/provision-admins.ts
 */

import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../src/db/mongodb.js';
import { AdminUserModel } from '../src/db/models/AdminUser.js';
import { config } from '../src/config/index.js';

const ALLOWED_EMAILS = [
  'karunsingh1602@gmail.com',
  'zimorindia@gmail.com',
];

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.length === 0 && !process.env.ADMIN_EMAIL) {
    console.log('Connecting to MongoDB Atlas...');
    await connectToDatabase();
    const admins = await AdminUserModel.find().lean();
    console.log('\n=== CURRENT PROVISIONED ADMINISTRATORS ===');
    console.log(`Allowlist Configuration: ${config.adminAllowedEmails.join(', ')}`);
    console.log(`Total DB Admin Accounts: ${admins.length}\n`);

    for (const a of admins) {
      const isAllowed = ALLOWED_EMAILS.includes(a.email.toLowerCase().trim());
      console.log(`- Account: ${a.email}`);
      console.log(`  Name: ${a.name}`);
      console.log(`  Role: ${a.role}`);
      console.log(`  Status: ${isAllowed ? '✓ AUTHORIZED & ACTIVE' : '✗ UNAUTHORIZED (BLOCKED BY ALLOWLIST)'}`);
      console.log(`  Hash Type: bcrypt (${a.passwordHash ? a.passwordHash.substring(0, 7) + '...' : 'none'})\n`);
    }

    if (admins.length !== 2) {
      console.warn(`WARNING: Expected exactly 2 administrators, found ${admins.length}`);
    }
    process.exit(0);
  }

  const email = (args[0] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || '';
  const name = args[2] || process.env.ADMIN_NAME || (email.startsWith('karun') ? 'Karun Rajkumar Singh' : 'Zimor India Admin');

  if (!email || !password) {
    console.error('Error: Email and password are required.');
    console.error('Usage: npx tsx scripts/provision-admins.ts <email> <password> [name]');
    process.exit(1);
  }

  if (!ALLOWED_EMAILS.includes(email)) {
    console.error(`\n[SECURITY REJECTION] Email "${email}" is NOT an authorized administrator.`);
    console.error(`Only the following accounts can be provisioned:\n- ${ALLOWED_EMAILS.join('\n- ')}\n`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters in length for security.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB Atlas to securely provision ${email}...`);
  await connectToDatabase();

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const updated = await AdminUserModel.findOneAndUpdate(
    { email },
    {
      email,
      passwordHash,
      name,
      role: 'superadmin',
    },
    { upsert: true, new: true }
  );

  console.log(`\n✓ SUCCESS: Administrator account "${email}" successfully provisioned with bcrypt hash.`);
  console.log(`  Admin ID: ${updated._id}`);
  console.log(`  Role: ${updated.role}`);
  console.log(`  Allowlist Status: VERIFIED`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[Provisioning Error]', err);
  process.exit(1);
});
