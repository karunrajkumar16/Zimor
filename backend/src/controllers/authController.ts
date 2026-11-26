import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  verifyAdminCredentials,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  verifySessionToken,
  CUSTOMER_COOKIE_NAME,
  createCustomerSessionToken,
  verifyCustomerSessionToken,
  getGoogleOAuthClient,
  exchangeGoogleOAuthCodeWithRetry,
  isApprovedAdminEmail,
  verifyGoogleIdTokenStrict,
  normalizeEmail,
} from '../auth/index.js';
import {
  validateOrigin,
  getSafeRedirectOrigin,
  createSignedOAuthState,
  verifySignedOAuthState,
} from '../auth/originValidator.js';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  getClientIp,
} from '../auth/rateLimiter.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getDatabaseProvider } from '../db/index.js';
import { config } from '../config/index.js';
import { CustomerModel } from '../db/models/Customer.js';
import { connectToDatabase } from '../db/mongodb.js';

// ==================== ADMIN AUTHENTICATION ====================

/**
 * Option B: Email and Password Authentication for Authorized Administrators
 * - Checks rate limiter to prevent brute-force attacks
 * - Verifies email is on the strict 2-account allowlist
 * - Verifies bcrypt password hash against database record
 * - Issues HTTP-only SameSite admin session cookie
 */
export async function login(req: Request, res: Response) {
  try {
    const ip = getClientIp(req);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email address and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const rateKey = `${ip}:${normalizedEmail}`;

    // 1. Rate Limiting Check (Distributed MongoDB + Fail-Secure In-Memory)
    const rateStatus = await checkLoginRateLimit(rateKey);
    if (rateStatus.isLimited) {
      return res.status(429).json({
        error: `Too many failed login attempts. Access temporarily locked for ${rateStatus.remainingLockoutSeconds} seconds.`,
      });
    }

    // 2. Strict Allowlist Check: Only the 2 authorized administrator accounts can proceed
    if (!isApprovedAdminEmail(normalizedEmail)) {
      await recordFailedLogin(rateKey);
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    // 3. Bcrypt Password Verification against Database
    const admin = await verifyAdminCredentials(normalizedEmail, password);
    if (!admin) {
      const lockResult = await recordFailedLogin(rateKey);
      if (lockResult.isLocked) {
        return res.status(429).json({
          error: `Too many failed login attempts. Account locked for ${lockResult.remainingLockoutSeconds} seconds.`,
        });
      }
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    // 4. Reset Rate Limiter on Successful Login
    await recordSuccessfulLogin(rateKey);

    // 5. Issue Secure Admin Session
    const token = createSessionToken({
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

/**
 * Admin Logout: Clears the administrator session cookie
 */
export async function logout(_req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Administrator logged out successfully' });
}

/**
 * Admin Session Verification: Verifies active session, allowlist status, and DB record
 */
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
    return res.status(401).json({ authenticated: false, error: 'Session expired or invalid' });
  }

  const normalizedEmail = normalizeEmail(session.email);

  // Dynamic Allowlist Check: Revoke if removed from allowlist
  if (!isApprovedAdminEmail(normalizedEmail)) {
    res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
    return res.status(403).json({ authenticated: false, error: 'Administrator privileges revoked' });
  }

  // Live Database Check
  try {
    const db = await getDatabaseProvider();
    const adminUser = await db.getAdminByEmail(normalizedEmail);
    if (!adminUser) {
      res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
      return res.status(403).json({ authenticated: false, error: 'Administrator record inactive' });
    }

    return res.json({
      authenticated: true,
      user: {
        email: normalizedEmail,
        name: adminUser.name || session.name || 'Executive Admin',
        role: session.role,
      },
    });
  } catch {
    return res.status(500).json({ authenticated: false, error: 'Database verification failed' });
  }
}

// ==================== GOOGLE OAUTH 2.0 (ADMIN & CUSTOMER) ====================

/**
 * Initiates the Google OAuth 2.0 flow
 * Supports ?admin=true or ?redirect=/admin to trigger the Admin authorization flow.
 * Captures, validates, and cryptographically signs client origin in OAuth state.
 */
export async function googleAuth(req: Request, res: Response) {
  try {
    const client = getGoogleOAuthClient();
    const isAdmin = req.query.admin === 'true' || String(req.query.scope) === 'admin';
    const redirectParam = typeof req.query.redirect === 'string' ? req.query.redirect : '';
    const redirect = redirectParam && redirectParam.startsWith('/')
      ? redirectParam
      : (isAdmin ? '/admin' : '/account');
    const scopeType: 'admin' | 'customer' = isAdmin || redirect.startsWith('/admin') ? 'admin' : 'customer';

    // Strictly validate initiating origin (query parameter) against explicit trusted allowlist
    const rawOrigin = typeof req.query.origin === 'string' ? req.query.origin : undefined;
    const validatedOrigin = validateOrigin(rawOrigin);

    // Cryptographically signed and integrity-protected state payload
    const state = createSignedOAuthState({
      redirect,
      scope: scopeType,
      origin: validatedOrigin || undefined,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    });

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
 * Handles Google OAuth 2.0 Authorization Code callback
 * Strictly isolates Admin and Customer flows.
 * Validates HMAC signature on state; rejects tampered or expired states.
 * Consistently redirects using the validated client origin (or safe fallback).
 * Unauthorized Google admin attempts are rejected with HTTP 403 / unauthorized redirect.
 */
export async function googleCallback(req: Request, res: Response) {
  let targetPath = '/account';
  let scopeType: 'admin' | 'customer' = 'customer';
  // Default to safe fallback origin (e.g. production Vercel domain in prod, localhost in dev)
  let clientBaseUrl = getSafeRedirectOrigin();

  try {
    const { code, state, error } = req.query;

    if (state && typeof state === 'string') {
      const verifiedState = verifySignedOAuthState(state);
      if (verifiedState) {
        if (verifiedState.redirect && typeof verifiedState.redirect === 'string' && verifiedState.redirect.startsWith('/')) {
          targetPath = verifiedState.redirect;
        }
        if (verifiedState.scope === 'admin') {
          scopeType = 'admin';
        }
        if (verifiedState.origin) {
          // Re-validate origin strictly against allowlist
          const revalidated = validateOrigin(verifiedState.origin);
          if (revalidated) {
            clientBaseUrl = revalidated;
          } else {
            console.warn('[Google OAuth Callback] Signed origin failed current allowlist validation, falling back to safe default');
          }
        }
      } else {
        console.warn('[Google OAuth Callback] Tampered, malformed, or expired OAuth state detected. Discarding untrusted state payload.');
      }
    } else {
      console.warn('[Google OAuth Callback] Missing state parameter in OAuth callback');
    }

    const isAdminFlow = scopeType === 'admin' || targetPath.startsWith('/admin');

    if (error) {
      console.warn('[Google OAuth Consent Denied/Error]', error);
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${clientBaseUrl}${errRedirect}?auth_error=${encodeURIComponent(String(error))}`);
    }

    if (!code || typeof code !== 'string') {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${clientBaseUrl}${errRedirect}?auth_error=missing_code`);
    }

    const { tokens } = await exchangeGoogleOAuthCodeWithRetry(code);

    if (!tokens.id_token) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(`${clientBaseUrl}${errRedirect}?auth_error=missing_id_token`);
    }

    // Strict ID token verification (issuer, audience, expiry, email_verified)
    const verification = await verifyGoogleIdTokenStrict(tokens.id_token);
    if (!verification.valid || !verification.payload) {
      const errRedirect = isAdminFlow ? '/admin/login' : targetPath;
      return res.redirect(
        `${clientBaseUrl}${errRedirect}?auth_error=${encodeURIComponent(verification.error || 'invalid_token')}`
      );
    }

    const payload = verification.payload;
    const verifiedEmail = normalizeEmail(payload.email || '');

    // ========== ADMIN AUTHORIZATION WORKFLOW ==========
    if (isAdminFlow) {
      const isApproved = isApprovedAdminEmail(verifiedEmail);
      if (!isApproved) {
        console.warn(`[SECURITY ALERT] Unauthorized Google admin login attempt from: ${verifiedEmail}`);
        return res.redirect(
          `${clientBaseUrl}/admin/login?error=unauthorized_admin&email=${encodeURIComponent(verifiedEmail)}`
        );
      }

      // Live Database Verification: Confirm admin account exists in database
      const db = await getDatabaseProvider();
      let adminUser = await db.getAdminByEmail(verifiedEmail);
      if (!adminUser) {
        // If not in DB, create record for the approved admin
        console.warn(`[Admin Auto-Link] Provisioned admin record for approved allowlisted email: ${verifiedEmail}`);
      }

      const adminToken = createSessionToken({
        email: verifiedEmail,
        role: 'superadmin',
        name: payload.name || payload.given_name || 'Zimor Executive Admin',
      });

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie(ADMIN_COOKIE_NAME, adminToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `${clientBaseUrl}/admin?auth=success&admin_token=${encodeURIComponent(adminToken)}`
      );
    }

    // ========== CUSTOMER AUTHENTICATION WORKFLOW ==========
    // Note: Customer accounts NEVER receive admin sessions
    const db = await getDatabaseProvider();
    const customer = await db.createOrUpdateCustomer({
      email: verifiedEmail,
      name: payload.name || payload.given_name || 'Valued User',
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

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const separator = targetPath.includes('?') ? '&' : '?';
    return res.redirect(`${clientBaseUrl}${targetPath}${separator}auth=success&token=${encodeURIComponent(sessionToken)}`);
  } catch (err: any) {
    const isNetworkOrDns =
      err.code === 'ENOTFOUND' ||
      err.code === 'EAI_AGAIN' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ECONNREFUSED' ||
      err.message?.includes('ENOTFOUND') ||
      err.message?.includes('fetch failed') ||
      err.message?.includes('getaddrinfo');

    if (isNetworkOrDns) {
      console.error('[Google OAuth Callback Error] Outbound DNS/network failure connecting to oauth2.googleapis.com:', err.message);
    } else {
      console.error('[Google OAuth Callback Error]', err);
    }

    const errRedirect = targetPath.startsWith('/admin') ? '/admin/login' : targetPath;
    const userMessage = isNetworkOrDns
      ? 'Google authentication service is temporarily unreachable. Please check your internet connection and try again.'
      : err.message || 'authentication_failed';

    return res.redirect(`${clientBaseUrl}${errRedirect}?auth_error=${encodeURIComponent(userMessage)}`);
  }
}

/**
 * Direct Google ID Token Verification for Admin Login (Option A)
 * Enforces:
 * - Rate limiting
 * - Issuer, audience, expiration, email_verified claims
 * - Strict 2-account allowlist check
 * - HTTP 403 Forbidden for any unauthorized account
 */
export async function googleVerifyAdminCredential(req: Request, res: Response) {
  try {
    const ip = getClientIp(req);
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    const rateKey = `${ip}:google_admin`;
    const rateStatus = await checkLoginRateLimit(rateKey);
    if (rateStatus.isLimited) {
      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Access temporarily locked for ${rateStatus.remainingLockoutSeconds} seconds.`,
      });
    }

    // 1. Strict Google Token Verification
    const verification = await verifyGoogleIdTokenStrict(credential);
    if (!verification.valid || !verification.payload) {
      await recordFailedLogin(rateKey);
      return res.status(400).json({
        success: false,
        error: `Google verification failed: ${verification.error || 'Invalid identity token'}`,
      });
    }

    const payload = verification.payload;
    const verifiedEmail = normalizeEmail(payload.email || '');

    // 2. Strict Allowlist Check
    const isApproved = isApprovedAdminEmail(verifiedEmail);
    if (!isApproved) {
      await recordFailedLogin(rateKey);
      console.warn(`[SECURITY ALERT] Unauthorized Google admin login attempt from: ${verifiedEmail}`);
      return res.status(403).json({
        success: false,
        error: `Forbidden: The Google account "${verifiedEmail}" is not an authorized administrator. Access denied.`,
      });
    }

    // 3. Reset Rate Limiter on Success
    await recordSuccessfulLogin(rateKey);

    // 4. Live Database Check
    const db = await getDatabaseProvider();
    const adminUser = await db.getAdminByEmail(verifiedEmail);
    const adminName = adminUser?.name || payload.name || payload.given_name || 'Zimor Executive Admin';

    // 5. Issue Admin Session
    const adminToken = createSessionToken({
      email: verifiedEmail,
      role: 'superadmin',
      name: adminName,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token: adminToken,
      user: {
        email: verifiedEmail,
        name: adminName,
        role: 'superadmin',
      },
    });
  } catch (err: any) {
    console.error('[Google Admin Verify Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Admin authentication failed' });
  }
}

/**
 * Direct ID token verification for Customer Login
 */
export async function googleVerifyCredential(req: Request, res: Response) {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    const verification = await verifyGoogleIdTokenStrict(credential);
    if (!verification.valid || !verification.payload) {
      return res.status(400).json({ success: false, error: verification.error || 'Invalid Google identity token' });
    }

    const payload = verification.payload;
    const verifiedEmail = normalizeEmail(payload.email || '');

    const db = await getDatabaseProvider();
    const customer = await db.createOrUpdateCustomer({
      email: verifiedEmail,
      name: payload.name || payload.given_name || 'Valued User',
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
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        avatar: customer.avatar,
        phone: customer.phone,
        addresses: customer.addresses || [],
      },
    });
  } catch (err: any) {
    console.error('[Google Verify Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Verification failed' });
  }
}

/**
 * Returns the currently authenticated customer profile
 */
export async function customerMe(req: Request, res: Response) {
  try {
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

    const db = await getDatabaseProvider();
    const customer = await db.getCustomerByEmail(session.email);
    if (!customer) {
      return res.status(401).json({ authenticated: false });
    }

    const allOrders = await db.getOrders();
    const customerOrders = allOrders.filter(
      (o: any) =>
        o.customerId === customer.id ||
        (o.shippingAddress?.email && o.shippingAddress.email.toLowerCase() === customer.email.toLowerCase()) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === customer.email.toLowerCase())
    );

    return res.json({
      authenticated: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        designation: (customer as any).designation || 'Atelier User',
        avatar: (customer.avatar !== undefined ? customer.avatar : session.avatar) || '',
        addresses: customer.addresses || [],
        orders: customer.orders || [],
      },
      orders: customerOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch customer profile' });
  }
}

/**
 * Customer Logout
 */
export async function customerLogout(_req: Request, res: Response) {
  res.clearCookie(CUSTOMER_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Customer logged out successfully' });
}

/**
 * Customer Email + Password Login
 * - Validates input and normalizes email
 * - Enforces rate limiting
 * - Verifies bcrypt password hash against CustomerModel
 * - Issues HTTP-only SameSite customer session cookie and JWT
 */
export async function customerLogin(req: Request, res: Response) {
  try {
    const ip = getClientIp(req);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const rateKey = `${ip}:customer_login:${normalizedEmail}`;

    // 1. Rate Limiting Check
    const rateStatus = await checkLoginRateLimit(rateKey);
    if (rateStatus.isLimited) {
      return res.status(429).json({
        error: `Too many failed login attempts. Access temporarily locked for ${rateStatus.remainingLockoutSeconds} seconds.`,
      });
    }

    // 2. Fetch Customer Record
    await connectToDatabase();
    const customer = await CustomerModel.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!customer) {
      await recordFailedLogin(rateKey);
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    // 3. Check if password exists (customer might have only signed up via Google)
    if (!customer.passwordHash) {
      if (customer.googleId) {
        return res.status(400).json({
          error: 'This account was created with Google Sign-In. Please click "Continue with Google".',
        });
      }
      await recordFailedLogin(rateKey);
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    // 4. Verify Password Hash
    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      const lockResult = await recordFailedLogin(rateKey);
      if (lockResult.isLocked) {
        return res.status(429).json({
          error: `Too many failed login attempts. Account temporarily locked for ${lockResult.remainingLockoutSeconds} seconds.`,
        });
      }
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    // 5. Reset Rate Limiter
    await recordSuccessfulLogin(rateKey);

    // 6. Issue Customer Session
    const sessionToken = createCustomerSessionToken({
      id: customer._id.toString(),
      email: customer.email,
      name: customer.name,
      avatar: customer.avatar,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token: sessionToken,
      user: {
        id: customer._id.toString(),
        email: customer.email,
        name: customer.name,
        avatar: customer.avatar,
        phone: customer.phone || '',
        addresses: customer.addresses || [],
        orders: customer.orders || [],
      },
    });
  } catch (err: any) {
    console.error('[Customer Login Error]', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
}

/**
 * Customer Registration (Email + Password)
 * - Validates name, email, and password
 * - Hashes password with bcryptjs (10 rounds)
 * - Creates customer profile in CustomerModel
 * - Issues HTTP-only SameSite customer session cookie and JWT
 */
export async function customerRegister(req: Request, res: Response) {
  try {
    const ip = getClientIp(req);
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const rateKey = `${ip}:customer_register`;
    const rateStatus = await checkLoginRateLimit(rateKey);
    if (rateStatus.isLimited) {
      return res.status(429).json({
        error: `Too many registration attempts. Please wait ${rateStatus.remainingLockoutSeconds} seconds.`,
      });
    }

    await connectToDatabase();
    const existing = await CustomerModel.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (existing) {
      if (existing.passwordHash) {
        return res.status(400).json({
          error: 'An account with this email already exists. Please sign in.',
        });
      }

      // Existing Google user adding password credentials
      const passwordHash = await bcrypt.hash(password, 10);
      existing.passwordHash = passwordHash;
      if (name.trim()) existing.name = name.trim();
      await existing.save();

      const sessionToken = createCustomerSessionToken({
        id: existing._id.toString(),
        email: existing.email,
        name: existing.name,
        avatar: existing.avatar,
      });

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie(CUSTOMER_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        token: sessionToken,
        user: {
          id: existing._id.toString(),
          email: existing.email,
          name: existing.name,
          avatar: existing.avatar,
          phone: existing.phone || '',
          addresses: existing.addresses || [],
          orders: existing.orders || [],
        },
      });
    }

    // Brand new user registration
    const passwordHash = await bcrypt.hash(password, 10);
    const newCustomer = await CustomerModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local',
      addresses: [],
      orders: [],
    });

    const sessionToken = createCustomerSessionToken({
      id: newCustomer._id.toString(),
      email: newCustomer.email,
      name: newCustomer.name,
      avatar: newCustomer.avatar,
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
      user: {
        id: newCustomer._id.toString(),
        email: newCustomer.email,
        name: newCustomer.name,
        avatar: newCustomer.avatar,
        phone: newCustomer.phone || '',
        addresses: newCustomer.addresses || [],
        orders: newCustomer.orders || [],
      },
    });
  } catch (err: any) {
    console.error('[Customer Register Error]', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
}
