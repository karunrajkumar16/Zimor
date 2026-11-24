import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import {
  seedDemoDataHandler,
  clearDemoDataHandler,
  getDemoStatusHandler,
  getInventoryMovementsHandler,
} from '../controllers/demoController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import {
  handleNotificationStream,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService.js';

const router = Router();

router.get('/stats', requireAdminAuth, getStats);

// Real-Time Admin Notifications (SSE Stream & Management)
router.get('/notifications/stream', requireAdminAuth, handleNotificationStream);
router.get('/notifications', requireAdminAuth, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const unreadOnly = req.query.unreadOnly === 'true';
    const result = await getNotifications({ limit, page, unreadOnly });
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch notifications' });
  }
});
router.patch('/notifications/:id/read', requireAdminAuth, async (req, res) => {
  try {
    const result = await markNotificationAsRead(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to mark notification as read' });
  }
});
router.post('/notifications/mark-all-read', requireAdminAuth, async (_req, res) => {
  try {
    const result = await markAllNotificationsAsRead();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to mark all as read' });
  }
});

// 7-Day Isolated Demo Sandbox Management
router.get('/demo/status', requireAdminAuth, getDemoStatusHandler);
router.post('/demo/seed', requireAdminAuth, seedDemoDataHandler);
router.delete('/demo', requireAdminAuth, clearDemoDataHandler);
router.delete('/demo/clear', requireAdminAuth, clearDemoDataHandler);
router.get('/inventory-movements', requireAdminAuth, getInventoryMovementsHandler);

export default router;
