import { Router } from 'express';
import {
  getConnectionStatus,
  checkServiceability,
  createShipmentForOrder,
  assignAwbForOrder,
  generateLabelForOrder,
  trackOrderShipment,
  cancelShipmentForOrder,
  retryFulfillmentForOrder,
  advanceDemoMilestone,
  renderDemoShippingLabel,
  handleShiprocketWebhook,
} from '../controllers/shippingController.js';

const router = Router();

// Shiprocket Logistics APIs
router.get('/status', getConnectionStatus);
router.post('/serviceability', checkServiceability);
router.post('/orders/:orderId/shipment', createShipmentForOrder);
router.post('/orders/:orderId/awb', assignAwbForOrder);
router.post('/orders/:orderId/label', generateLabelForOrder);
router.get('/orders/:orderId/track', trackOrderShipment);
router.post('/orders/:orderId/cancel', cancelShipmentForOrder);
router.post('/orders/:orderId/retry-fulfillment', retryFulfillmentForOrder);
router.post('/orders/:orderId/demo-advance', advanceDemoMilestone);
router.get('/demo-label/:shipmentId', renderDemoShippingLabel);

// Shiprocket Inbound Webhook (URL does NOT contain restricted keywords)
router.post('/webhook', handleShiprocketWebhook);

export default router;
