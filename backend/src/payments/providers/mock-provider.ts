// DEV ONLY: Mock payment provider for local testing
// NEVER active in production — blocked by NODE_ENV check in index.ts
import crypto from 'crypto';
import { PaymentProvider, PaymentOrder, PaymentVerificationResult, RefundResult } from './interface';

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(options: {
    orderId: string;
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<PaymentOrder> {
    // Simulate a Razorpay order object for dev testing
    console.log('[MOCK PAYMENT] Creating order:', options);
    return {
      id: options.orderId,
      providerOrderId: `mock_order_${crypto.randomUUID()}`,
      amount: options.amount,
      currency: options.currency || 'INR',
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
    // In dev, accept any payment as valid
    console.log('[MOCK PAYMENT] Verifying payment:', params);
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
    console.log('[MOCK PAYMENT] Processing refund:', params);
    return {
      success: true,
      refundId: `mock_refund_${crypto.randomUUID()}`,
    };
  }
  
  async getOrder(providerOrderId: string): Promise<PaymentOrder | null> {
    console.log('[MOCK PAYMENT] Getting order:', providerOrderId);
    return null; // Mock orders are not persisted
  }

  async getPayment(paymentId: string): Promise<any> {
    console.log('[MOCK PAYMENT] Getting payment:', paymentId);
    return {
      id: paymentId,
      status: 'captured',
      amount: 10000,
      currency: 'INR',
    };
  }
}
