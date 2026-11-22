import { Request, Response, NextFunction } from 'express';
import {
  verifySessionToken,
  verifyCustomerSessionToken,
  isApprovedAdminEmail,
  normalizeEmail,
  ADMIN_COOKIE_NAME,
  CUSTOMER_COOKIE_NAME,
} from '../auth/index.js';
import { getDatabaseProvider } from '../db/index.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    email: string;
    role: string;
    name?: string;
  };
  customer?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  userType?: 'admin' | 'customer';
}

export async function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[ADMIN_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    }

    // 1. Cryptographic token & expiry verification
    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session' });
    }

    // 2. Strict Role Verification: Must be administrator role (customers strictly denied)
    if (session.role !== 'superadmin' && session.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    // 3. Dynamic Allowlist Check: Verify email is currently in the 2-account allowlist
    const normalizedEmail = normalizeEmail(session.email);
    if (!isApprovedAdminEmail(normalizedEmail)) {
      return res.status(403).json({ error: 'Forbidden: Admin access revoked or account not authorized' });
    }

    // 4. Live Database Check: Verify admin account is active in database
    const db = await getDatabaseProvider();
    const adminUser = await db.getAdminByEmail(normalizedEmail);
    if (!adminUser) {
      return res.status(403).json({ error: 'Forbidden: Administrator record not active' });
    }

    req.admin = {
      email: normalizedEmail,
      role: session.role,
      name: adminUser.name || session.name || 'Executive Admin',
    };

    next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication error' });
  }
}

/**
 * Middleware ensuring request is made by an authenticated customer OR an authenticated administrator.
 * Injects req.customer or req.admin and req.userType.
 */
export async function authenticateCustomerOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // 1. Check Admin Auth first
    let adminToken = req.cookies?.[ADMIN_COOKIE_NAME];
    if (!adminToken && req.headers.authorization?.startsWith('Bearer ')) {
      adminToken = req.headers.authorization.split(' ')[1];
    }
    if (adminToken) {
      const adminSession = verifySessionToken(adminToken);
      if (adminSession && isApprovedAdminEmail(adminSession.email)) {
        req.admin = {
          email: adminSession.email,
          role: adminSession.role,
          name: adminSession.name,
        };
        req.userType = 'admin';
        return next();
      }
    }

    // 2. Check Customer Auth
    let customerToken = req.cookies?.[CUSTOMER_COOKIE_NAME];
    if (!customerToken && req.headers.authorization?.startsWith('Bearer ')) {
      customerToken = req.headers.authorization.split(' ')[1];
    }
    if (!customerToken && req.headers['x-customer-token']) {
      customerToken = req.headers['x-customer-token'] as string;
    }

    if (customerToken) {
      const customerSession = verifyCustomerSessionToken(customerToken);
      if (customerSession) {
        req.customer = {
          id: customerSession.id,
          email: customerSession.email,
          name: customerSession.name,
          avatar: customerSession.avatar,
        };
        req.userType = 'customer';
        return next();
      }
    }

    return res.status(401).json({ error: 'Authentication required. Please sign in to access this resource.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication error' });
  }
}
