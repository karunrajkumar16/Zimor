import {
  isApprovedAdminEmail,
  verifySessionToken,
  createSessionToken,
  createCustomerSessionToken,
  verifyAdminCredentials,
  normalizeEmail,
} from './src/auth/index.js';
import { connectToDatabase } from './src/db/mongodb.js';
import { AdminUserModel } from './src/db/models/AdminUser.js';
import { CustomerModel } from './src/db/models/Customer.js';
import { config } from './src/config/index.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

async function runSecurityTestSuite() {
  console.log('\n============================================================');
  console.log('      ZIMOR ADMIN SECURITY & ACCESS CONTROL TEST SUITE      ');
  console.log('============================================================\n');

  await connectToDatabase();

  // Test 1: Authorized Admin Email Allowlist Integrity
  console.log('1. Checking Email Allowlist Enforcement:');
  const allowed = config.adminAllowedEmails;
  assert(
    allowed.length === 2 &&
      allowed.includes('karunsingh1602@gmail.com') &&
      allowed.includes('zimorindia@gmail.com'),
    'Allowlist contains exactly the two authorized admin emails'
  );
  assert(
    !allowed.includes('admin@zimor.in'),
    'Legacy/dummy admin "admin@zimor.in" is excluded from allowlist'
  );
  assert(
    !allowed.includes('attacker@hacker.com'),
    'Arbitrary emails are excluded from allowlist'
  );
  assert(
    isApprovedAdminEmail('karunsingh1602@gmail.com') === true,
    'karunsingh1602@gmail.com is approved'
  );
  assert(
    isApprovedAdminEmail('   ZimorIndia@Gmail.Com  ') === true,
    'zimorindia@gmail.com with casing/whitespace is normalized and approved'
  );
  assert(
    isApprovedAdminEmail('unauthorized@gmail.com') === false,
    'unauthorized@gmail.com is strictly rejected'
  );

  // Test 2: Database Account Count & Password Hashing
  console.log('\n2. Checking Database Provisioning & Password Hashing:');
  const dbAdmins = await AdminUserModel.find().lean();
  assert(
    dbAdmins.length === 2,
    `Database has exactly 2 admin records (found: ${dbAdmins.length})`
  );

  const dbEmails = dbAdmins.map((a) => a.email);
  assert(
    dbEmails.includes('karunsingh1602@gmail.com') && dbEmails.includes('zimorindia@gmail.com'),
    'Database contains both karunsingh1602@gmail.com and zimorindia@gmail.com'
  );

  for (const adm of dbAdmins) {
    const isBcrypt = adm.passwordHash?.startsWith('$2a$') || adm.passwordHash?.startsWith('$2b$');
    assert(
      isBcrypt,
      `Admin ${adm.email} password is stored as bcrypt hash with salt (no plaintext)`
    );
  }

  // Test 3: Password Authentication Verification
  console.log('\n3. Checking Password Authentication Security:');
  const invalidEmailResult = await verifyAdminCredentials('attacker@random.com', 'SomePassword123!');
  assert(
    invalidEmailResult === null,
    'Unauthorized email with any password is rejected (null)'
  );

  const wrongPasswordResult = await verifyAdminCredentials('karunsingh1602@gmail.com', 'CompletelyWrongPass!999');
  assert(
    wrongPasswordResult === null,
    'Authorized email with incorrect password is rejected (null)'
  );

  // Test 4: Customer Account Access Boundary
  console.log('\n4. Checking Customer Account Isolation:');
  const customerSessionToken = createCustomerSessionToken({
    id: 'cust-test-123',
    email: 'karunsingh1602@gmail.com',
    name: 'Karun (Customer Profile)',
  });
  const verifiedAsAdmin = verifySessionToken(customerSessionToken);
  assert(
    verifiedAsAdmin === null,
    'Customer session token is rejected when evaluated as admin session (role separation enforced)'
  );

  // Test 5: Expired Session Token Rejection
  console.log('\n5. Checking Expired Session Token Rejection:');
  // Create an artificially expired session
  const expiredPayload = {
    email: 'karunsingh1602@gmail.com',
    role: 'superadmin' as const,
    name: 'Karun',
    exp: Date.now() - 5000, // 5 seconds in the past
  };
  const crypto = await import('crypto');
  const data = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
  const expiredToken = `${data}.${signature}`;
  const verifiedExpired = verifySessionToken(expiredToken);
  assert(
    verifiedExpired === null,
    'Expired admin session token is rejected immediately'
  );

  // Test 6: Revoked Account Session Rejection
  console.log('\n6. Checking Revoked Session Rejection:');
  const revokedPayload = {
    email: 'revoked_employee@zimor.in',
    role: 'admin' as const,
    name: 'Former Staff',
    exp: Date.now() + 60000,
  };
  const revokedData = Buffer.from(JSON.stringify(revokedPayload)).toString('base64url');
  const revokedSig = crypto.createHmac('sha256', config.jwtSecret).update(revokedData).digest('base64url');
  const revokedToken = `${revokedData}.${revokedSig}`;
  const verifiedRevoked = verifySessionToken(revokedToken);
  assert(
    verifiedRevoked === null,
    'Valid signed session for non-allowlisted email is rejected (instant revocation)'
  );

  // Test 7: Valid Authorized Admin Session Creation & Verification
  console.log('\n7. Checking Valid Session Token Lifecycle:');
  const validToken = createSessionToken({
    email: 'zimorindia@gmail.com',
    role: 'superadmin',
    name: 'Zimor Executive Admin',
  });
  const verifiedValid = verifySessionToken(validToken);
  assert(
    verifiedValid !== null && verifiedValid.email === 'zimorindia@gmail.com',
    'Valid session token for authorized admin verifies successfully with correct claims'
  );

  console.log('\n============================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('ALL MANDATORY SECURITY CHECKS PASSED WITH 100% SUCCESS.');
  } else {
    console.error('FAILURES DETECTED IN SECURITY CHECKS.');
    process.exit(1);
  }
  console.log('============================================================\n');

  process.exit(0);
}

runSecurityTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
