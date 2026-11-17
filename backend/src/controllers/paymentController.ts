import { Request, Response } from 'express';
import crypto from 'crypto';
import { getPaymentProvider } from '../payments/index.js';
import { getDatabaseProvider } from '../db/index.js';
import { config } from '../config/index.js';

export async function createPaymentOrder(req: Request, res: Response) {
  try {
    const { amount, currency = 'INR', receipt, notes, orderId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const paymentProvider = getPaymentProvider();
    const paymentOrder = await paymentProvider.createOrder({
      orderId: orderId || `ord_${Date.now()}`,
      amount: Math.round(amount * 100), // in paise
      currency,
      receipt: receipt || `rec_${Date.now()}`,
      notes,
    });

    return res.status(201).json({ success: true, paymentOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to create payment order' });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, paymentId, signature } = req.body;
    const rzpOrderId = razorpayOrderId || orderId;
    const rzpPaymentId = razorpayPaymentId || paymentId;
    const rzpSignature = razorpaySignature || signature;

    if (!rzpOrderId || !rzpPaymentId || !rzpSignature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification credentials' });
    }

    const paymentProvider = getPaymentProvider();
    const result = await paymentProvider.verifyPayment({
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: rzpSignature,
    });

    return res.json({ verified: result.success, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (config.razorpay.webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const db = await getDatabaseProvider();
      const rzpOrderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
      if (rzpOrderId) {
        const orders = await db.getOrders();
        const matched = orders.find((o) => (o as any).razorpayOrderId === rzpOrderId);
        if (matched) {
          await db.updateOrderStatus(matched.id, 'Confirmed');
        }
      }
    }

    return res.json({ status: 'ok' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}

export async function getPayments(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const orders = await db.getOrders();

    const payments = orders.map((order: any) => ({
      id: `PAY-${(order.id || order.orderNumber || '000000').slice(-6).toUpperCase()}`,
      orderId: order.orderNumber || order.id,
      customerName: order.shippingAddress?.fullName || 'Valued Client',
      customerEmail: order.customerEmail || order.customer?.email || 'client@zimor.in',
      amount: order.total || order.totalAmount || 0,
      currency: 'INR',
      method: order.paymentMethod || 'ONLINE',
      transactionId: order.trackingNumber || `tx_${(order.id || '00000000').slice(0, 8)}`,
      status: order.status === 'Cancelled' ? 'REFUNDED' : 'SUCCESS',
      createdAt: order.date || order.createdAt || new Date().toISOString(),
    }));

    return res.json({ payments });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
}
