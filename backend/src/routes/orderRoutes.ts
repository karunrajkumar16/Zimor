import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  trackOrder,
  createOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/track', trackOrder);
router.get('/', requireAdminAuth, getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id', requireAdminAuth, updateOrderStatus);

export default router;
