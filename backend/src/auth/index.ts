import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';

export const ADMIN_COOKIE_NAME = 'zimor_admin_session';
export const CUSTOMER_COOKIE_NAME = 'zimor_customer_session';

export interface AdminSession {
  email: string;
  role: 'superadmin' | 'admin';
  name?: string;
  exp: number;
}

export interface CustomerSession {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer';
  exp: number;
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Checks if an email is present in the backend ADMIN_ALLOWED_EMAILS allowlist.
 * Strictly permits only the 2 authorized administrator accounts.
 */
export function isApprovedAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return config.adminAllowedEmails.includes(normalized);
}

/**
 * Creates a cryptographically signed HMAC-SHA256 admin session token (8 hours expiration)
 */
export function createSessionToken(session: { email: string; role: 'superadmin' | 'admin'; name?: string }): string {
  const normalizedEmail = normalizeEmail(session.email);
  const payload: AdminSession = {
    email: normalizedEmail,
    role: session.role,
    name: session.name || 'Executive Admin',
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies the HMAC-SHA256 signature, expiration, admin role, and allowlist membership
 */
export function verifySessionToken(token: string): AdminSession | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: AdminSession = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) {
      return null;
    }

    // Role check: must be admin or superadmin (never customer)
    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return null;
    }

    // Allowlist check: must remain an active approved administrator
    if (!isApprovedAdminEmail(payload.email)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates a customer session token (30 days expiration)
 */
export function createCustomerSessionToken(session: { id: string; email: string; name: string; avatar?: string }): string {
  const payload: CustomerSession = {
    ...session,
    role: 'customer',
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies a customer session token
 */
export function verifyCustomerSessionToken(token: string): CustomerSession | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: CustomerSession = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now() || payload.role !== 'customer') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Instantiates the Google OAuth2 client with backend credentials
 */
export function getGoogleOAuthClient(): OAuth2Client {
  return new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.callbackUrl
  );
}

/**
 * Verifies administrator email and password against bcrypt-hashed credentials.
 * Rejects any non-allowlisted email immediately.
 * Never stores or compares plaintext passwords.
 */
export async function verifyAdminCredentials(
  email: string,
  pass: string
): Promise<{ email: string; role: 'superadmin' | 'admin'; name: string } | null> {
  const normalized = normalizeEmail(email);

  // 1. Strict allowlist boundary
  if (!isApprovedAdminEmail(normalized)) {
    return null;
  }

  // 2. Fetch administrator record from database
  try {
    const { getDatabaseProvider } = await import('../db/index.js');
    const db = await getDatabaseProvider();
    const adminUser = await db.getAdminByEmail(normalized);

    if (!adminUser || !adminUser.passwordHash) {
      return null;
    }

    // 3. Compare with bcrypt
    const isMatch = await bcrypt.compare(pass, adminUser.passwordHash);
    if (!isMatch) {
      return null;
    }

    return {
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name || 'Executive Admin',
    };
  } catch (err) {
    console.error('[verifyAdminCredentials] Database authentication error:', err);
    return null;
  }
}

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 12
 */
export async function hashAdminPassword(plaintext: string): Promise<string> {
  if (!plaintext || plaintext.length < 8) {
    throw new Error('Admin password must be at least 8 characters in length');
  }
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plaintext, salt);
}
