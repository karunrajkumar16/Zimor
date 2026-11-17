import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '../auth/index.js';

export interface AuthenticatedRequest extends Request {
  admin?: {
    email: string;
    role: string;
  };
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[ADMIN_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }

    req.admin = session;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication error' });
  }
}
