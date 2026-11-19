import { Request, Response } from 'express';
import {
  verifyAdminCredentials,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  verifySessionToken,
  CUSTOMER_COOKIE_NAME,
  createCustomerSessionToken,
  verifyCustomerSessionToken,
  getGoogleOAuthClient,
  isApprovedAdminEmail,
  normalizeEmail,
} from '../auth/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getDatabaseProvider } from '../db/index.js';
import { config } from '../config/index.js';

// ==================== RATE LIMITING & BRUTE FORCE PROTECTION ====================

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

function getRateLimitKey(req: Request, email?: string): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  return `${ip}:${normalizeEmail(email || '')}`;
}

function checkRateLimit(req: Request, email?: string): { isLocked: boolean; remainingMinutes: number } {
  const key = getRateLimitKey(req, email);
  const record = loginAttempts.get(key);

  if (!record) {
    return { isLocked: false, remainingMinutes: 0 };
  }

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingMs = record.lockedUntil - now;
    return { isLocked: true, remainingMinutes: Math.ceil(remainingMs / (60 * 1000)) };
  }

  // Lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginAttempts.delete(key);
  }

  return { isLocked: false, remainingMinutes: 0 };
}

function recordFailedLogin(req: Request, email?: string) {
  const key = getRateLimitKey(req, email);
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0, lockedUntil: 0 };

  record.attempts += 1;
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.warn(`[SECURITY LOCKOUT] Admin login brute-force threshold reached for ${key}. Locked for 15 minutes.`);
  }

  loginAttempts.set(key, record);
}

function clearLoginAttempts(req: Request, email?: string) {
  const key = getRateLimitKey(req, email);
  loginAttempts.delete(key);
}

// ==================== ADMIN AUTHENTICATION ====================

/**
 * Administrator Email and Password authentication endpoint.
 * Validates against the 2-account allowlist and bcrypt-hashed password.
 * Rate-limited to prevent brute-force attacks.
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const normalized = normalizeEmail(email);

    // Rate limit check
    const { isLocked, remainingMinutes } = checkRateLimit(req, normalized);
    if (isLocked) {
      return res.status(429).json({
        error: `Too many failed login attempts. Portal access temporarily restricted. Please try again in ${remainingMinutes} minutes.`,
      });
    }

    // Strict Allowlist Check: Only the 2 authorized emails
    if (!isApprovedAdminEmail(normalized)) {
      recordFailedLogin(req, normalized);
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    const admin = await verifyAdminCredentials(normalized, password);
    if (!admin) {
      recordFailedLogin(req, normalized);
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    // Successful login: clear failure counter
    clearLoginAttempts(req, normalized);

    const token = createSessionToken({
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    return res.json({
      success: true,
      token,
      user: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  let token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  // Double check allowlist
  if (!isApprovedAdminEmail(session.email)) {
    return res.status(403).json({ authenticated: false, error: 'Forbidden: Admin access revoked' });
  }

  return res.json({ authenticated: true, user: session });
}

// ==================== GOOGLE OAUTH 2.0 (ADMIN & CUSTOMER) ====================

/**
 * Initiates the Google OAuth 2.0 flow by redirecting the user to Google
 * Supports ?admin=true or ?redirect=/admin to trigger the Admin authorization flow
 */
export async function googleAuth(req: Request, res: Response) {
  try {
    const client = getGoogleOAuthClient();
    const isAdmin = req.query.admin === 'true' || String(req.query.scope) === 'admin';
    const redirect = (req.query.redirect as string) || (isAdmin ? '/admin' : '/account');
    const scopeType = isAdmin || redirect.startsWith('/admin') ? 'admin' : 'customer';

    const state = Buffer.from(JSON.stringify({ redirect, scope: scopeType })).toString('base64url');

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state,
    });

    return res.redirect(authUrl);
  } catch (err: any) {
    console.error('[Google Auth Error]', err);
    return res.status(500).json({ error: err.message || 'Failed to initiate Google authentication' });
  }
}

/**
 * Handles the Google OAuth 2.0 Authorization Code callback for both Admin and Customer flows
 */
export async function googleCallback(req: Request, res: Response) {
  let targetPath = '/account';
  let scopeType = 'customer';

  try {
    const { code, state, error } = req.query;

    if (state && typeof state === 'string') {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
        if (parsed.redirect && typeof parsed.redirect === 'string' && parsed.redirect.startsWith('/')) {
          targetPath = parsed.redirect;
        }
        if (parsed.scope === 'admin') {
          scopeType = 'admin';
        }
      } catch {}
    }

    const isAdminFlow = scopeType === 'admin' || targetPath.startsWith('/admin');

    if (error) {
      console.warn('[Google OAuth Consent Denied/Error]', error);
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=${encodeURIComponent(String(error))}`);
    }

    if (!code || typeof code !== 'string') {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=missing_code`);
    }

    const client = getGoogleOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=missing_id_token`);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=invalid_payload`);
    }

    // Verify token claims (Issuer, Audience, Expiration, and email_verified)
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss || '')) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=invalid_issuer`);
    }

    if (payload.aud !== config.google.clientId) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=invalid_audience`);
    }

    if (!payload.email_verified) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=email_not_verified`);
    }

    const normalizedEmail = normalizeEmail(payload.email);

    // ========== ADMIN AUTHORIZATION WORKFLOW ==========
    if (isAdminFlow) {
      // Strict 2-account allowlist check
      if (!isApprovedAdminEmail(normalizedEmail)) {
        console.warn(`[SECURITY ALERT] Unauthorized Google admin login attempt from: ${normalizedEmail}`);
        return res.redirect(
          `${config.clientUrl}/admin/login?error=unauthorized_admin&email=${encodeURIComponent(normalizedEmail)}`
        );
      }

      const adminToken = createSessionToken({
        email: normalizedEmail,
        role: 'superadmin',
        name: payload.name || payload.given_name || 'Zimor Executive Admin',
      });

      res.cookie(ADMIN_COOKIE_NAME, adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      return res.redirect(
        `${config.clientUrl}/admin?auth=success&admin_token=${encodeURIComponent(adminToken)}`
      );
    }

    // ========== CUSTOMER AUTHENTICATION WORKFLOW ==========
    const db = await getDatabaseProvider();
    const customer = await db.createOrUpdateCustomer({
      email: normalizedEmail,
      name: payload.name || payload.given_name || 'Valued Patron',
      googleId: payload.sub,
      avatar: payload.picture,
      authProvider: 'google',
    });

    const sessionToken = createCustomerSessionToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      avatar: customer.avatar,
    });

    res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const separator = targetPath.includes('?') ? '&' : '?';
    return res.redirect(`${config.clientUrl}${targetPath}${separator}auth=success&token=${encodeURIComponent(sessionToken)}`);
  } catch (err: any) {
    console.error('[Google OAuth Callback Error]', err);
    const errRedirect = targetPath.startsWith('/admin') ? '/admin/login' : targetPath;
    return res.redirect(`${config.clientUrl}${errRedirect}?auth_error=${encodeURIComponent(err.message || 'authentication_failed')}`);
  }
}

/**
 * Direct ID token verification for Google in-page Sign-In (Admin)
 * Strictly enforces token issuer, audience, expiration, verified-email, and 2-account allowlist.
 */
export async function googleVerifyAdminCredential(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    const client = getGoogleOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google identity token' });
    }

    // Verify token claims
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss || '')) {
      return res.status(403).json({ success: false, error: 'Invalid token issuer' });
    }

    if (payload.aud !== config.google.clientId) {
      return res.status(403).json({ success: false, error: 'Invalid token audience' });
    }

    if (!payload.email_verified) {
      return res.status(403).json({ success: false, error: 'Google email address is not verified' });
    }

    const normalizedEmail = normalizeEmail(payload.email);

    // Strict 2-account allowlist check
    if (!isApprovedAdminEmail(normalizedEmail)) {
      console.warn(`[SECURITY ALERT] Unauthorized Google admin credential attempt from: ${normalizedEmail}`);
      return res.status(403).json({
        success: false,
        error: `Forbidden: The Google account "${normalizedEmail}" is not an authorized administrator.`,
      });
    }

    const adminToken = createSessionToken({
      email: normalizedEmail,
      role: 'superadmin',
      name: payload.name || payload.given_name || 'Zimor Executive Admin',
    });

    res.cookie(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token: adminToken,
      user: {
        email: normalizedEmail,
        name: payload.name || payload.given_name || 'Zimor Executive Admin',
        role: 'superadmin',
      },
    });
  } catch (err: any) {
    console.error('[Google Admin Verify Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Admin authentication failed' });
  }
}

/**
 * Direct ID token verification for Google One Tap or in-page Google Sign-In (Customer)
 */
export async function googleVerifyCredential(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    const client = getGoogleOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google identity token' });
    }

    if (!payload.email_verified) {
      return res.status(403).json({ success: false, error: 'Google email address is not verified' });
    }

    const normalizedEmail = normalizeEmail(payload.email);
    const db = await getDatabaseProvider();
    const customer = await db.createOrUpdateCustomer({
      email: normalizedEmail,
      name: payload.name || payload.given_name || 'Valued Patron',
      googleId: payload.sub,
      avatar: payload.picture,
      authProvider: 'google',
    });

    const sessionToken = createCustomerSessionToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      avatar: customer.avatar,
    });

    res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token: sessionToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        avatar: customer.avatar,
      },
    });
  } catch (err: any) {
    console.error('[Google Customer Verify Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Customer authentication failed' });
  }
}

// ==================== CUSTOMER REGISTRATION & SESSION MANAGEMENT ====================

export async function customerRegister(req: Request, res: Response) {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const db = await getDatabaseProvider();
    const existing = await db.getCustomerByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const customer = await db.createOrUpdateCustomer({
      email: normalizedEmail,
      name,
      phone,
      authProvider: 'local',
    });

    const sessionToken = createCustomerSessionToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      avatar: customer.avatar,
    });

    res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token: sessionToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        avatar: customer.avatar,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
}

export async function customerLogin(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const db = await getDatabaseProvider();
    const customer = await db.getCustomerByEmail(normalizedEmail);
    if (!customer) {
      return res.status(401).json({ error: 'Invalid customer credentials' });
    }

    const sessionToken = createCustomerSessionToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      avatar: customer.avatar,
    });

    res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token: sessionToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        avatar: customer.avatar,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
}

export async function customerLogout(_req: Request, res: Response) {
  res.clearCookie(CUSTOMER_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
}

export async function customerMe(req: Request, res: Response) {
  let token = req.cookies?.[CUSTOMER_COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const session = verifyCustomerSessionToken(token);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, customer: session });
}
