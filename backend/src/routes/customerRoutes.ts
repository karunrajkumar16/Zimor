import { Router } from 'express';
import { getCustomers } from '../controllers/customerController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdminAuth, getCustomers);

export default router;
