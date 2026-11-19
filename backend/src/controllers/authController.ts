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
} from '../auth/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getDatabaseProvider } from '../db/index.js';
import { config } from '../config/index.js';

// ==================== ADMIN AUTHENTICATION ====================

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = await verifyAdminCredentials(email, password);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

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

    // ========== ADMIN AUTHORIZATION WORKFLOW ==========
    if (isAdminFlow) {
      const isApproved = await isApprovedAdminEmail(payload.email);
      if (!isApproved) {
        console.warn(`[SECURITY ALERT] Unauthorized Google admin login attempt from: ${payload.email}`);
        return res.redirect(
          `${config.clientUrl}/admin/login?error=unauthorized_admin&email=${encodeURIComponent(payload.email)}`
        );
      }

      const adminToken = createSessionToken({
        email: payload.email,
        role: 'superadmin',
        name: payload.name || payload.given_name || 'Zimor Executive Admin',
      });

      res.cookie(ADMIN_COOKIE_NAME, adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `${config.clientUrl}/admin?auth=success&admin_token=${encodeURIComponent(adminToken)}`
      );
    }

    // ========== CUSTOMER AUTHENTICATION WORKFLOW ==========
    const db = await getDatabaseProvider();
    const customer = await db.createOrUpdateCustomer({
      email: payload.email,
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
 * Direct ID token verification for Google One Tap or in-page Google Sign-In (Admin)
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

    const isApproved = await isApprovedAdminEmail(payload.email);
    if (!isApproved) {
      console.warn(`[SECURITY ALERT] Unauthorized Google admin credential attempt from: ${payload.email}`);
      return res.status(403).json({
        success: false,
        error: `Access Denied: The Google account "${payload.email}" is not an authorized administrator.`,
      });
    }

    const adminToken = createSessionToken({
      email: payload.email,
      role: 'superadmin',
      name: payload.name || payload.given_name || 'Zimor Executive Admin',
    });

    res.cookie(ADMIN_COOKIE_NAME, adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token: adminToken,
      user: {
        email: payload.email,
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
 * Direct ID token verification for Google One Tap or in-page Google Sign-In
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

    const db = await getDatabaseProvider();
    const customer = await db.createOrUpdateCustomer({
      email: payload.email,
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
 * Returns the currently authenticated customer profile and genuine order history
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

    // Fetch customer's genuine orders from database
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
        designation: (customer as any).designation || 'Atelier Patron',
        avatar: customer.avatar || session.avatar || '',
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
 * Logs out the customer by clearing the session cookie
 */
export async function customerLogout(_req: Request, res: Response) {
  res.clearCookie(CUSTOMER_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Customer logged out successfully' });
}
