import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAdminAuth, getStats);

export default router;
