export interface PaymentOrder {
  id: string;           // internal order ID
  providerOrderId: string; // Razorpay order ID or mock ID
  amount: number;       // amount in paise (smallest unit)
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  receipt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId?: string;
  signature?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface PaymentProvider {
  createOrder(options: {
    orderId: string;      // our internal order ID
    amount: number;       // in paise
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<PaymentOrder>;
  
  verifyPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<PaymentVerificationResult>;
  
  refund(params: {
    paymentId: string;
    amount?: number;
    notes?: Record<string, string>;
  }): Promise<RefundResult>;
  
  getOrder(providerOrderId: string): Promise<PaymentOrder | null>;
}
