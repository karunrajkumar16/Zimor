// Production payment provider: Razorpay
// Switch from mock: set USE_MOCK_PAYMENT=false and provide RAZORPAY_* env vars
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentProvider, PaymentOrder, PaymentVerificationResult, RefundResult } from './interface.js';
import { config } from '../../config/index.js';

let razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID || config.razorpay.keyId;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || config.razorpay.keySecret;
    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
    }
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
}

export class RazorpayProvider implements PaymentProvider {
  async createOrder(options: {
    orderId: string;
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<PaymentOrder> {
    const rz = getRazorpay();
    const order = await rz.orders.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes || {},
    });
    return {
      id: options.orderId,
      providerOrderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      status: 'created',
      receipt: options.receipt,
      metadata: options.notes,
      createdAt: new Date().toISOString(),
    };
  }
  
  async verifyPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<PaymentVerificationResult> {
    const secret = process.env.RAZORPAY_KEY_SECRET || config.razorpay.keySecret || '';
    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    const sigBuf = Buffer.from(params.razorpaySignature, 'utf8');
    if (expBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expBuf, sigBuf)) {
      return {
        success: false,
        orderId: params.razorpayOrderId,
        error: 'Invalid payment signature',
      };
    }
    return {
      success: true,
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
      signature: params.razorpaySignature,
    };
  }
  
  async refund(params: {
    paymentId: string;
    amount?: number;
    notes?: Record<string, string>;
  }): Promise<RefundResult> {
    const rz = getRazorpay();
    const refundData: Record<string, unknown> = {};
    if (params.amount) refundData.amount = params.amount;
    if (params.notes) refundData.notes = params.notes;
    const refund = await rz.payments.refund(params.paymentId, refundData);
    return { success: true, refundId: refund.id };
  }
  
  async getOrder(providerOrderId: string): Promise<PaymentOrder | null> {
    const rz = getRazorpay();
    const order = await rz.orders.fetch(providerOrderId);
    if (!order) return null;
    return {
      id: providerOrderId,
      providerOrderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      status: order.status === 'paid' ? 'paid' : 'created',
      receipt: (order as any).receipt || '',
      createdAt: new Date().toISOString(),
    };
  }

  async getPayment(paymentId: string): Promise<any> {
    const rz = getRazorpay();
    return await rz.payments.fetch(paymentId);
  }
}
