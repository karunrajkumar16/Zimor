import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, isApprovedAdminEmail, normalizeEmail, ADMIN_COOKIE_NAME } from '../auth/index.js';
import { getDatabaseProvider } from '../db/index.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    email: string;
    role: string;
    name?: string;
  };
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
