import { Request, Response } from 'express';
import {
  verifyAdminCredentials,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  verifySessionToken,
} from '../auth/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

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
