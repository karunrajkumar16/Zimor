import crypto from 'crypto';
import { config } from '../config/index.js';

export interface OAuthStatePayload {
  redirect: string;
  scope: 'admin' | 'customer';
  origin?: string;
  nonce: string;
  timestamp: number;
}

/**
 * Strict allowlist of trusted production and preview frontend origins.
 * Prevents arbitrary origin redirection, open redirects, and wildcard *.vercel.app abuse.
 */
export const TRUSTED_ORIGINS = {
  production: 'https://frontend-rho-gilt-51.vercel.app',
  localDevelopment: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  // Specifically approved preview domains for ZIMOR Vercel deployments
  // Matches: https://frontend-<git-branch-or-hash>-karunrajkumar16s-projects.vercel.app
  approvedVercelPreviewRegex: /^https:\/\/frontend(?:-[a-z0-9-]+)?-karunrajkumar16s-projects\.vercel\.app$/i,
};

/**
 * Validates a candidate origin URL strictly against trusted origins.
 *
 * Rules:
 * 1. Must be a well-formed URL without path, credentials, or query parameters.
 * 2. In production (NODE_ENV=production), localhost/127.0.0.1 is NEVER trusted.
 * 3. Exact matching for the primary production domain and configured clientUrl.
 * 4. Scoped regex matching ONLY for specific project preview deployments (never arbitrary *.vercel.app).
 * 5. Supports explicit preview origins specified in APPROVED_PREVIEW_ORIGINS.
 */
export function validateOrigin(rawOrigin: string | undefined | null): string | null {
  if (!rawOrigin || typeof rawOrigin !== 'string') {
    return null;
  }

  const trimmed = rawOrigin.trim().replace(/\/+$/, '');
  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  // Ensure origin string is clean (no path, no query, no auth info)
  if (parsed.origin !== trimmed) {
    return null;
  }

  const originProtocol = parsed.protocol; // e.g. 'https:' or 'http:'
  const originHost = parsed.hostname.toLowerCase();
  const originPort = parsed.port;

  // 1. Localhost / Local Dev check
  const isLocalHost =
    (originHost === 'localhost' || originHost === '127.0.0.1') &&
    (originPort === '3000' || originPort === '') &&
    originProtocol === 'http:';

  if (isLocalHost) {
    // In production, localhost is strictly prohibited
    if (config.isProduction) {
      console.warn(`[Origin Validation] Blocked localhost origin in production mode: ${trimmed}`);
      return null;
    }
    return trimmed;
  }

  // All remote origins MUST use HTTPS
  if (originProtocol !== 'https:') {
    console.warn(`[Origin Validation] Blocked non-HTTPS remote origin: ${trimmed}`);
    return null;
  }

  // 2. Exact match against configured production frontend
  if (trimmed === TRUSTED_ORIGINS.production) {
    return TRUSTED_ORIGINS.production;
  }

  // 3. Exact match against config.clientUrl
  if (trimmed === config.clientUrl) {
    return config.clientUrl;
  }

  // 4. Specifically approved preview origins from environment variable
  if (config.trustedOrigins?.approvedPreviews?.length) {
    for (const approved of config.trustedOrigins.approvedPreviews) {
      if (trimmed.toLowerCase() === approved.toLowerCase()) {
        return trimmed;
      }
    }
  }

  // 5. Scoped Vercel preview domain pattern for this specific project and account
  if (TRUSTED_ORIGINS.approvedVercelPreviewRegex.test(trimmed)) {
    return trimmed;
  }

  console.warn(`[Origin Validation] Rejected unapproved origin: ${trimmed}`);
  return null;
}

/**
 * Returns a guaranteed-safe frontend base URL for OAuth redirects.
 * If candidate origin passes strict validation, it is returned.
 * Otherwise, falls back to the production frontend URL (or config.clientUrl).
 */
export function getSafeRedirectOrigin(candidateOrigin?: string | null): string {
  const validated = validateOrigin(candidateOrigin);
  if (validated) {
    return validated;
  }

  // Safe fallback
  if (config.isProduction) {
    return config.clientUrl && config.clientUrl !== 'http://localhost:3000'
      ? config.clientUrl
      : TRUSTED_ORIGINS.production;
  }

  return config.clientUrl || 'http://localhost:3000';
}

/**
 * Signs OAuth state using HMAC-SHA256 to ensure cryptographic integrity.
 * Prevents CSRF and tampering with redirect path, scope, or origin.
 */
export function createSignedOAuthState(payload: OAuthStatePayload): string {
  const serialized = JSON.stringify(payload);
  const dataB64 = Buffer.from(serialized, 'utf-8').toString('base64url');
  const hmac = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(dataB64)
    .digest('base64url');

  return `${dataB64}.${hmac}`;
}

/**
 * Verifies the integrity of a signed OAuth state.
 * Returns the payload if valid and unexpired; returns null if tampered, malformed, or expired.
 */
export function verifySignedOAuthState(rawState: string | undefined | null): OAuthStatePayload | null {
  if (!rawState || typeof rawState !== 'string') {
    return null;
  }

  const parts = rawState.split('.');
  if (parts.length !== 2) {
    console.warn('[OAuth State] Rejected unsigned or malformed state payload');
    return null;
  }

  const [dataB64, providedHmac] = parts;
  const expectedHmac = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(dataB64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const providedBuf = Buffer.from(providedHmac);
  const expectedBuf = Buffer.from(expectedHmac);

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    console.warn('[OAuth State] HMAC signature verification failed');
    return null;
  }

  try {
    const payload: OAuthStatePayload = JSON.parse(
      Buffer.from(dataB64, 'base64url').toString('utf-8')
    );

    // Validate expiration: 15 minutes max
    const maxAgeMs = 15 * 60 * 1000;
    if (typeof payload.timestamp === 'number' && Date.now() - payload.timestamp > maxAgeMs) {
      console.warn('[OAuth State] OAuth state has expired (>15 minutes)');
      return null;
    }

    return payload;
  } catch (err) {
    console.warn('[OAuth State] Failed to deserialize payload JSON');
    return null;
  }
}
