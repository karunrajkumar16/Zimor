import { Router } from 'express';
import { getCustomers, updateCustomerProfile } from '../controllers/customerController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdminAuth, getCustomers);
router.patch('/profile', updateCustomerProfile);

export default router;
