import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPayments,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/config', getPaymentConfig);
router.post('/create', createPaymentOrder);
router.post('/create-payment', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/verify-payment', verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/', requireAdminAuth, getPayments);

export default router;
