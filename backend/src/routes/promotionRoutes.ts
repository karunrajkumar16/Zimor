// backend/src/routes/promotionRoutes.ts
import { Router } from 'express';
import {
  validatePromotion,
  getPromotions,
  createOrUpdatePromotion,
} from '../controllers/promotionController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// Public validation endpoint for checkout
router.post('/validate', validatePromotion);

// Administrative management endpoints
router.get('/', requireAdminAuth, getPromotions);
router.post('/', requireAdminAuth, createOrUpdatePromotion);

export default router;
