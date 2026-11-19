import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, isApprovedAdminEmail, ADMIN_COOKIE_NAME, normalizeEmail } from '../auth/index.js';
import { config } from '../config/index.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    email: string;
    role: string;
    name?: string;
  };
}

/**
 * Middleware ensuring only authenticated and approved administrators can access protected endpoints.
 * Validates HMAC token signature, expiration, admin role, and allowlist membership.
 */
export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[ADMIN_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session' });
    }

    // Role check
    if (session.role !== 'admin' && session.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Customer accounts cannot access admin portal' });
    }

    // Re-verify against allowlist
    const normalizedEmail = normalizeEmail(session.email);
    if (!isApprovedAdminEmail(normalizedEmail)) {
      return res.status(403).json({ error: 'Forbidden: Account is not an authorized administrator' });
    }

    // CSRF Protection for state-changing browser requests
    const method = req.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const origin = req.headers.origin || req.headers.referer;
      if (origin) {
        try {
          const originHost = new URL(origin).host;
          const allowedHost = new URL(config.clientUrl).host;
          // In development, also accept localhost:3000 / localhost:5001
          const isAllowed =
            originHost === allowedHost ||
            originHost.startsWith('localhost') ||
            originHost.startsWith('127.0.0.1');

          if (!isAllowed) {
            return res.status(403).json({ error: 'Forbidden: Cross-site request rejected (CSRF protection)' });
          }
        } catch {
          // If URL parsing fails, continue if bearer token is present
        }
      }
    }

    req.admin = session;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication error' });
  }
}
