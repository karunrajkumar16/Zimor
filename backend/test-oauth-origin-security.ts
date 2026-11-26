import assert from 'assert';
import crypto from 'crypto';
import {
  validateOrigin,
  getSafeRedirectOrigin,
  createSignedOAuthState,
  verifySignedOAuthState,
  TRUSTED_ORIGINS,
} from './src/auth/originValidator.js';
import { config } from './src/config/index.js';

console.log('=== ZIMOR OAUTH ORIGIN & STATE SECURITY TEST SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function test(description: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`✓ [PASS] ${description}`);
    passedTests++;
  } catch (err: any) {
    console.error(`✗ [FAIL] ${description}:`, err.message);
    throw err;
  }
}

// -------------------------------------------------------------
// 1. Origin Validation Tests (Development Mode)
// -------------------------------------------------------------
console.log('--- Phase 1: Origin Validation in Development Mode ---');

test('Permits localhost:3000 in development mode', () => {
  const result = validateOrigin('http://localhost:3000');
  assert.strictEqual(result, 'http://localhost:3000');
});

test('Permits 127.0.0.1:3000 in development mode', () => {
  const result = validateOrigin('http://127.0.0.1:3000');
  assert.strictEqual(result, 'http://127.0.0.1:3000');
});

test('Permits official production frontend domain', () => {
  const result = validateOrigin('https://frontend-rho-gilt-51.vercel.app');
  assert.strictEqual(result, 'https://frontend-rho-gilt-51.vercel.app');
});

test('Permits approved repository-scoped Vercel preview domain', () => {
  const previewUrl = 'https://frontend-git-feature-karunrajkumar16s-projects.vercel.app';
  const result = validateOrigin(previewUrl);
  assert.strictEqual(result, previewUrl);
});

test('Rejects arbitrary unapproved *.vercel.app origins', () => {
  const arbitraryVercel = 'https://malicious-phishing-site.vercel.app';
  const result = validateOrigin(arbitraryVercel);
  assert.strictEqual(result, null, 'Arbitrary vercel.app domains must NOT be allowed');
});

test('Rejects another user/project vercel deployment', () => {
  const otherProject = 'https://frontend-fakeuser.vercel.app';
  const result = validateOrigin(otherProject);
  assert.strictEqual(result, null, 'Foreign project domains must be rejected');
});

test('Rejects external malicious phishing domain', () => {
  const phishing = 'https://evil-phishing-site.com';
  const result = validateOrigin(phishing);
  assert.strictEqual(result, null);
});

test('Rejects origins with paths, queries, or fragments', () => {
  assert.strictEqual(validateOrigin('https://frontend-rho-gilt-51.vercel.app/admin'), null);
  assert.strictEqual(validateOrigin('http://localhost:3000/?evil=true'), null);
  assert.strictEqual(validateOrigin('javascript:alert(1)'), null);
  assert.strictEqual(validateOrigin('data:text/html,evil'), null);
});

// -------------------------------------------------------------
// 2. Origin Validation Tests (Production Mode Enforcement)
// -------------------------------------------------------------
console.log('\n--- Phase 2: Origin Validation in Production Mode ---');

test('Prohibits localhost in production mode', () => {
  const originalEnv = config.isProduction;
  try {
    (config as any).isProduction = true;
    const localResult = validateOrigin('http://localhost:3000');
    assert.strictEqual(localResult, null, 'localhost must be strictly rejected when in production mode');
    const localIpResult = validateOrigin('http://127.0.0.1:3000');
    assert.strictEqual(localIpResult, null, '127.0.0.1 must be strictly rejected when in production mode');
  } finally {
    (config as any).isProduction = originalEnv;
  }
});

// -------------------------------------------------------------
// 3. Safe Redirect Origin Fallback Tests
// -------------------------------------------------------------
console.log('\n--- Phase 3: Safe Redirect Origin Fallback Resolution ---');

test('getSafeRedirectOrigin returns valid origin when approved', () => {
  const result = getSafeRedirectOrigin('https://frontend-rho-gilt-51.vercel.app');
  assert.strictEqual(result, 'https://frontend-rho-gilt-51.vercel.app');
});

test('getSafeRedirectOrigin safely falls back to trusted production domain when origin is unapproved', () => {
  const originalEnv = config.isProduction;
  try {
    (config as any).isProduction = true;
    const fallback = getSafeRedirectOrigin('https://attacker-open-redirect.com');
    assert.strictEqual(
      fallback,
      TRUSTED_ORIGINS.production,
      'Must safely fall back to production frontend for unapproved origins'
    );
  } finally {
    (config as any).isProduction = originalEnv;
  }
});

// -------------------------------------------------------------
// 4. Cryptographic OAuth State Signing & Verification
// -------------------------------------------------------------
console.log('\n--- Phase 4: Signed OAuth State Integrity & Anti-CSRF ---');

test('Successfully creates and verifies signed state payload', () => {
  const payload = {
    redirect: '/admin/orders',
    scope: 'admin' as const,
    origin: 'https://frontend-rho-gilt-51.vercel.app',
    nonce: crypto.randomBytes(16).toString('hex'),
    timestamp: Date.now(),
  };

  const signedState = createSignedOAuthState(payload);
  assert.ok(signedState.includes('.'), 'State must be separated by dot (data.hmac)');

  const verified = verifySignedOAuthState(signedState);
  assert.ok(verified, 'Verification must succeed for valid signed state');
  assert.strictEqual(verified?.redirect, '/admin/orders');
  assert.strictEqual(verified?.scope, 'admin');
  assert.strictEqual(verified?.origin, 'https://frontend-rho-gilt-51.vercel.app');
  assert.strictEqual(verified?.nonce, payload.nonce);
});

test('Rejects tampered OAuth state payload', () => {
  const payload = {
    redirect: '/account',
    scope: 'customer' as const,
    origin: 'https://frontend-rho-gilt-51.vercel.app',
    nonce: 'original-nonce',
    timestamp: Date.now(),
  };

  const signedState = createSignedOAuthState(payload);
  const [dataB64, hmac] = signedState.split('.');

  // Attacker tries to modify the payload to point to an evil origin
  const tamperedPayload = { ...payload, origin: 'https://evil.com' };
  const tamperedDataB64 = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
  const tamperedState = `${tamperedDataB64}.${hmac}`;

  const verified = verifySignedOAuthState(tamperedState);
  assert.strictEqual(verified, null, 'Tampered payload must fail HMAC verification');
});

test('Rejects unsigned legacy Base64 state', () => {
  const legacyUnsigned = Buffer.from(JSON.stringify({ redirect: '/admin', scope: 'admin' })).toString('base64url');
  const verified = verifySignedOAuthState(legacyUnsigned);
  assert.strictEqual(verified, null, 'Unsigned state payloads must be rejected');
});

test('Rejects expired OAuth state (>15 minutes old)', () => {
  const expiredPayload = {
    redirect: '/admin',
    scope: 'admin' as const,
    origin: 'https://frontend-rho-gilt-51.vercel.app',
    nonce: 'expired-nonce',
    timestamp: Date.now() - (16 * 60 * 1000), // 16 minutes ago
  };

  const signedState = createSignedOAuthState(expiredPayload);
  const verified = verifySignedOAuthState(signedState);
  assert.strictEqual(verified, null, 'State older than 15 minutes must be rejected');
});

// -------------------------------------------------------------
// 5. Controller Flow Tests (googleAuth & googleCallback)
// -------------------------------------------------------------
console.log('\n--- Phase 5: Controller End-to-End Simulation ---');

import { googleAuth, googleCallback } from './src/controllers/authController.js';

test('googleAuth embeds validated origin into state URL parameter', async () => {
  let redirectedUrl = '';
  const mockReq: any = {
    query: {
      redirect: '/admin',
      origin: 'https://frontend-rho-gilt-51.vercel.app',
      admin: 'true',
    },
  };
  const mockRes: any = {
    redirect: (url: string) => {
      redirectedUrl = url;
    },
  };

  await googleAuth(mockReq, mockRes);
  assert.ok(redirectedUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth'), 'Must redirect to Google OAuth URL');

  const parsedUrl = new URL(redirectedUrl);
  const stateParam = parsedUrl.searchParams.get('state');
  assert.ok(stateParam, 'Must contain state query parameter');

  const verifiedState = verifySignedOAuthState(stateParam);
  assert.ok(verifiedState, 'State must be validly signed');
  assert.strictEqual(verifiedState?.origin, 'https://frontend-rho-gilt-51.vercel.app');
  assert.strictEqual(verifiedState?.redirect, '/admin');
  assert.strictEqual(verifiedState?.scope, 'admin');
});

test('googleAuth discards unapproved origin from state', async () => {
  let redirectedUrl = '';
  const mockReq: any = {
    query: {
      redirect: '/account',
      origin: 'https://attacker.evil.com',
    },
  };
  const mockRes: any = {
    redirect: (url: string) => {
      redirectedUrl = url;
    },
  };

  await googleAuth(mockReq, mockRes);
  const parsedUrl = new URL(redirectedUrl);
  const stateParam = parsedUrl.searchParams.get('state');
  const verifiedState = verifySignedOAuthState(stateParam);
  assert.strictEqual(verifiedState?.origin, undefined, 'Unapproved origin must not be preserved in state');
});

test('googleCallback error redirects to the validated production origin', async () => {
  const signedState = createSignedOAuthState({
    redirect: '/admin',
    scope: 'admin',
    origin: 'https://frontend-rho-gilt-51.vercel.app',
    nonce: 'test-nonce',
    timestamp: Date.now(),
  });

  let callbackRedirectUrl = '';
  const mockReq: any = {
    query: {
      state: signedState,
      error: 'access_denied',
    },
  };
  const mockRes: any = {
    redirect: (url: string) => {
      callbackRedirectUrl = url;
    },
  };

  await googleCallback(mockReq, mockRes);
  assert.ok(
    callbackRedirectUrl.startsWith('https://frontend-rho-gilt-51.vercel.app/admin/login?auth_error='),
    `Redirect must go to production domain, got: ${callbackRedirectUrl}`
  );
});

test('googleCallback error redirects to localhost when initiated from localhost (in dev)', async () => {
  const signedState = createSignedOAuthState({
    redirect: '/account',
    scope: 'customer',
    origin: 'http://localhost:3000',
    nonce: 'test-nonce-local',
    timestamp: Date.now(),
  });

  let callbackRedirectUrl = '';
  const mockReq: any = {
    query: {
      state: signedState,
      error: 'access_denied',
    },
  };
  const mockRes: any = {
    redirect: (url: string) => {
      callbackRedirectUrl = url;
    },
  };

  await googleCallback(mockReq, mockRes);
  assert.ok(
    callbackRedirectUrl.startsWith('http://localhost:3000/account?auth_error='),
    `Redirect must go to localhost domain in dev, got: ${callbackRedirectUrl}`
  );
});

test('googleCallback error redirects to approved preview deployment', async () => {
  const previewOrigin = 'https://frontend-git-fix-karunrajkumar16s-projects.vercel.app';
  const signedState = createSignedOAuthState({
    redirect: '/account',
    scope: 'customer',
    origin: previewOrigin,
    nonce: 'test-nonce-preview',
    timestamp: Date.now(),
  });

  let callbackRedirectUrl = '';
  const mockReq: any = {
    query: {
      state: signedState,
      error: 'access_denied',
    },
  };
  const mockRes: any = {
    redirect: (url: string) => {
      callbackRedirectUrl = url;
    },
  };

  await googleCallback(mockReq, mockRes);
  assert.ok(
    callbackRedirectUrl.startsWith(`${previewOrigin}/account?auth_error=`),
    `Redirect must go to approved preview domain, got: ${callbackRedirectUrl}`
  );
});

test('googleCallback rejects tampered state and redirects to safe fallback', async () => {
  // Tampered state: signature does not match
  const tamperedState = 'eyJhbGciOiJIUzI1NiJ9.invalidsignature';

  let callbackRedirectUrl = '';
  const mockReq: any = {
    query: {
      state: tamperedState,
      error: 'access_denied',
    },
  };
  const mockRes: any = {
    redirect: (url: string) => {
      callbackRedirectUrl = url;
    },
  };

  await googleCallback(mockReq, mockRes);
  assert.ok(
    callbackRedirectUrl.startsWith(`${config.clientUrl}/account?auth_error=`),
    `Redirect with tampered state must fall back safely, got: ${callbackRedirectUrl}`
  );
});

console.log(`\n======================================================`);
console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} tests successful.`);
console.log(`======================================================\n`);
