import crypto from 'crypto';
import { config } from '../config/index.js';

export const ADMIN_COOKIE_NAME = 'zimor_admin_session';

export interface AdminSession {
  email: string;
  role: 'superadmin' | 'admin';
  name?: string;
  exp: number;
}

export function createSessionToken(session: { email: string; role: 'superadmin' | 'admin'; name?: string }): string {
  const payload: AdminSession = {
    ...session,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

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

    return payload;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, pass: string): Promise<{ email: string; role: 'superadmin' | 'admin'; name: string } | null> {
  if (email.toLowerCase() === config.adminEmail.toLowerCase() && pass === config.adminPassword) {
    return {
      email: config.adminEmail,
      role: 'superadmin',
      name: 'Zimor Executive Admin',
    };
  }
  return null;
}
