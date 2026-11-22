import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  trackOrder,
  createOrder,
  updateOrderStatus,
  downloadOrderInvoice,
  requestOrderReturn,
  reviewReturnRequest,
  processOrderRefund,
} from '../controllers/orderController.js';
import { requireAdminAuth, authenticateCustomerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/track', trackOrder);
router.get('/', requireAdminAuth, getOrders);
router.get('/:orderNumber/invoice', authenticateCustomerOrAdmin, downloadOrderInvoice);
router.post('/:orderNumber/return-request', authenticateCustomerOrAdmin, requestOrderReturn);
router.post('/:orderNumber/return-decision', requireAdminAuth, reviewReturnRequest);
router.post('/:orderNumber/refund', requireAdminAuth, processOrderRefund);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id', requireAdminAuth, updateOrderStatus);

export default router;
