import readline from 'readline';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../src/db/mongodb.js';
import { AdminUserModel } from '../src/db/models/AdminUser.js';
import { normalizeEmail } from '../src/auth/index.js';
import { config } from '../src/config/index.js';

const AUTHORIZED_ADMINS = [
  {
    email: 'karunsingh1602@gmail.com',
    name: 'Karun Rajkumar Singh',
    role: 'superadmin' as const,
  },
  {
    email: 'zimorindia@gmail.com',
    name: 'Zimor India Admin',
    role: 'superadmin' as const,
  },
];

function promptQuestion(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function runProvisioning() {
  console.log('=== ZIMOR SECURE ADMIN PROVISIONING ===');
  console.log('Target Allowlist:');
  AUTHORIZED_ADMINS.forEach((adm) => console.log(` - ${adm.name} <${adm.email}> [${adm.role}]`));
  console.log('======================================');

  await connectToDatabase();
  console.log('[MongoDB Atlas] Connected successfully.\n');

  // Step 1: Remove unauthorized legacy or test admin accounts
  const authorizedEmails = AUTHORIZED_ADMINS.map((a) => normalizeEmail(a.email));
  const removeResult = await AdminUserModel.deleteMany({
    email: { $nin: authorizedEmails },
  });
  if (removeResult.deletedCount > 0) {
    console.log(`[Security Cleanup] Removed ${removeResult.deletedCount} unauthorized legacy admin record(s).`);
  }

  // Parse arguments or environment variables if provided non-interactively
  const args = process.argv.slice(2);
  const argMap: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1] && !args[i + 1].startsWith('--')) {
      argMap[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (const admin of AUTHORIZED_ADMINS) {
    const normalized = normalizeEmail(admin.email);
    console.log(`\nConfiguring administrator: ${admin.email}`);

    // Check if password passed via env or args
    let password = '';
    if (normalized === 'karunsingh1602@gmail.com') {
      password = process.env.ADMIN_PASSWORD_KARUN || argMap['password-karun'] || '';
    } else if (normalized === 'zimorindia@gmail.com') {
      password = process.env.ADMIN_PASSWORD_ZIMOR || argMap['password-zimor'] || '';
    }

    if (!password && argMap.email === normalized && argMap.password) {
      password = argMap.password;
    }

    // Interactive fallback if not in env/args
    if (!password) {
      const existing = await AdminUserModel.findOne({ email: normalized });
      if (existing && existing.passwordHash && !existing.passwordHash.startsWith('oauth_')) {
        const keep = await promptQuestion(
          rl,
          `An active bcrypt password already exists for ${normalized}. Keep existing password? (Y/n): `
        );
        if (keep.toLowerCase() !== 'n') {
          console.log(`[Kept] Existing password preserved for ${normalized}.`);
          continue;
        }
      }

      while (!password || password.length < 8) {
        password = await promptQuestion(rl, `Enter secure password for ${normalized} (min 8 chars): `);
        if (password.length < 8) {
          console.log('Error: Password must be at least 8 characters long.');
        }
      }
    }

    if (password.length < 8) {
      throw new Error(`Password for ${normalized} must be at least 8 characters long`);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await AdminUserModel.findOneAndUpdate(
      { email: normalized },
      {
        email: normalized,
        name: admin.name,
        passwordHash,
        role: admin.role,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[Success] Administrator ${normalized} provisioned with salted bcrypt hash (rounds=12).`);
  }

  rl.close();

  // Final count and integrity check
  const allAdmins = await AdminUserModel.find().lean();
  console.log('\n=== PROVISIONING SUMMARY ===');
  console.log(`Total Administrator Accounts: ${allAdmins.length} (Target: 2)`);
  allAdmins.forEach((adm) => {
    const isHashed = adm.passwordHash?.startsWith('$2a$') || adm.passwordHash?.startsWith('$2b$');
    console.log(` - ${adm.email} | Name: ${adm.name} | Role: ${adm.role} | Bcrypt Hashed: ${isHashed}`);
  });

  if (allAdmins.length === 2) {
    console.log('\n[PASS] Exactly TWO authorized administrator accounts are provisioned in MongoDB Atlas.');
  } else {
    console.error('\n[FAIL] Discrepancy in administrator accounts count.');
    process.exit(1);
  }

  process.exit(0);
}

runProvisioning().catch((err) => {
  console.error('[Provisioning Error]', err);
  process.exit(1);
});
