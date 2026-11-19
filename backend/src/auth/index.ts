import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
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
 * Normalizes an email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Checks whether an email is in the strict 2-account backend allowlist.
 * The ONLY authorized administrator email addresses are configured in ADMIN_ALLOWED_EMAILS.
 */
export function isApprovedAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  return config.adminAllowedEmails.includes(normalized);
}

/**
 * Creates an HMAC-SHA256 signed admin session token.
 * Expires in 7 days.
 */
export function createSessionToken(session: { email: string; role: 'superadmin' | 'admin'; name?: string }): string {
  const normalizedEmail = normalizeEmail(session.email);
  const payload: AdminSession = {
    email: normalizedEmail,
    role: session.role,
    name: session.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies an admin session token signature and expiration.
 * Enforces role check (only 'superadmin' or 'admin').
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

    // Role boundary: Must be administrator role
    if (payload.role !== 'superadmin' && payload.role !== 'admin') {
      return null;
    }

    // Allowlist check: Revoke token immediately if email is no longer on the authorized allowlist
    if (!isApprovedAdminEmail(payload.email)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates an HMAC-SHA256 signed customer session token.
 * Customer sessions are kept strictly separated from administrator sessions.
 */
export function createCustomerSessionToken(session: { id: string; email: string; name: string; avatar?: string }): string {
  const payload: CustomerSession = {
    ...session,
    email: normalizeEmail(session.email),
    role: 'customer',
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies customer session token.
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

export function getGoogleOAuthClient(): OAuth2Client {
  return new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.callbackUrl
  );
}

/**
 * Strict Google ID token verification:
 * Checks token signature, issuer, audience, expiration, and email_verified claim.
 */
export async function verifyGoogleIdTokenStrict(idToken: string): Promise<{
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}> {
  try {
    const client = getGoogleOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return { valid: false, error: 'Empty token payload' };
    }

    // Verify Issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!payload.iss || !validIssuers.includes(payload.iss)) {
      return { valid: false, error: 'Invalid Google token issuer' };
    }

    // Verify Audience
    if (payload.aud !== config.google.clientId) {
      return { valid: false, error: 'Google token audience mismatch' };
    }

    // Verify Expiration
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      return { valid: false, error: 'Google token has expired' };
    }

    // Verify Email Verified Claim
    if (payload.email_verified !== true) {
      return { valid: false, error: 'Google email address is not verified' };
    }

    if (!payload.email) {
      return { valid: false, error: 'Google token does not contain an email address' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Google token verification failed' };
  }
}

/**
 * Verifies email and password credentials for an administrator.
 * Only the two authorized administrator accounts in ADMIN_ALLOWED_EMAILS can authenticate.
 * Uses bcrypt password hashing (never plaintext).
 */
export async function verifyAdminCredentials(
  email: string,
  pass: string
): Promise<{ email: string; role: 'superadmin' | 'admin'; name: string } | null> {
  if (!email || !pass) return null;
  const normalized = normalizeEmail(email);

  // 1. Strict Allowlist check: Only authorized administrator emails are permitted
  if (!isApprovedAdminEmail(normalized)) {
    return null;
  }

  // 2. Fetch admin user from database
  try {
    const { getDatabaseProvider } = await import('../db/index.js');
    const db = await getDatabaseProvider();
    const adminUser = await db.getAdminByEmail(normalized);
    if (!adminUser || !adminUser.passwordHash) {
      return null;
    }

    // 3. Bcrypt comparison (securely reject any plaintext or non-matching password)
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
    console.error('[verifyAdminCredentials] DB lookup error:', err);
    return null;
  }
}
