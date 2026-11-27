import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env reliably regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Safe resolution of clientUrl: prevents module initialization crashes while enforcing production security
function resolveClientUrl(): string {
  const rawUrl = process.env.CLIENT_URL?.trim();

  if (!rawUrl) {
    if (isProduction) {
      console.warn(
        '[CONFIG NOTICE] Missing CLIENT_URL environment variable in production. ' +
        'Defaulting safely to authorized production origin: https://zimorworld.com.'
      );
      return 'https://zimorworld.com';
    }
    return 'http://localhost:3000';
  }

  const cleanUrl = rawUrl.replace(/\/+$/, '');

  if (isProduction && (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1'))) {
    console.warn(
      `[CONFIG WARNING] Invalid production CLIENT_URL "${cleanUrl}". ` +
      'Production deployments must not point to localhost. Defaulting safely to https://zimorworld.com.'
    );
    return 'https://zimorworld.com';
  }

  return cleanUrl;
}

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  clientUrl: resolveClientUrl(),
  isProduction,
  trustedOrigins: {
    production: 'https://zimor-frontend.vercel.app',
    customDomain: 'https://zimorworld.com',
    approvedPreviews: (process.env.APPROVED_PREVIEW_ORIGINS || '')
      .split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter(Boolean),
  },

  // Database
  mongoUri: process.env.MONGODB_URI || '',
  useMockDb: process.env.USE_MOCK_DB !== 'false',

  // Media
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  useMockMedia: process.env.USE_MOCK_MEDIA !== 'false',

  // Payment
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  useMockPayment: process.env.USE_MOCK_PAYMENT !== 'false',

  // Admin Authentication Allowlist (Strictly 2 Authorized Accounts)
  adminAllowedEmails: (process.env.ADMIN_ALLOWED_EMAILS || 'karunsingh1602@gmail.com,zimorindia@gmail.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  jwtSecret: process.env.ADMIN_JWT_SECRET || 'zimor_secret_jwt_key_2024_luxury_atelier_token',

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
  },
};
