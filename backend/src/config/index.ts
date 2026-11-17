import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env reliably regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',

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

  // Auth
  adminEmail: process.env.ADMIN_EMAIL || 'admin@zimor.in',
  adminPassword: process.env.ADMIN_PASSWORD || 'zimor_admin_2024',
  jwtSecret: process.env.ADMIN_JWT_SECRET || 'zimor_secret_jwt_key_2024_luxury_atelier_token',
};
