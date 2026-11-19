import { Router } from 'express';
import {
  login,
  logout,
  me,
  googleAuth,
  googleCallback,
  googleVerifyCredential,
  googleVerifyAdminCredential,
  customerMe,
  customerLogout,
} from '../controllers/authController.js';

const router = Router();

// Admin Authentication
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/google/verify-admin', googleVerifyAdminCredential);

// Customer Google OAuth 2.0
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/google/verify', googleVerifyCredential);

// Customer Session Management
router.get('/customer/me', customerMe);
router.post('/customer/logout', customerLogout);

export default router;
