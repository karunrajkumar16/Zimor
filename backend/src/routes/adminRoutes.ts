import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import {
  seedDemoDataHandler,
  clearDemoDataHandler,
  getDemoStatusHandler,
  getInventoryMovementsHandler,
} from '../controllers/demoController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAdminAuth, getStats);

// 7-Day Isolated Demo Sandbox Management
router.get('/demo/status', requireAdminAuth, getDemoStatusHandler);
router.post('/demo/seed', requireAdminAuth, seedDemoDataHandler);
router.delete('/demo', requireAdminAuth, clearDemoDataHandler);
router.delete('/demo/clear', requireAdminAuth, clearDemoDataHandler);
router.get('/inventory-movements', requireAdminAuth, getInventoryMovementsHandler);

export default router;
