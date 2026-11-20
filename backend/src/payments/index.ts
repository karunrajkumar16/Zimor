// Selects payment provider based on USE_MOCK_PAYMENT env var
// USE_MOCK_PAYMENT=true  → mock (dev only, always succeeds)
// USE_MOCK_PAYMENT=false → Razorpay (production)
import { PaymentProvider } from './providers/interface.js';
import { MockPaymentProvider } from './providers/mock-provider.js';
import { RazorpayProvider } from './providers/razorpay-provider.js';

let paymentProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (paymentProvider) return paymentProvider;
  
  const useMock = process.env.USE_MOCK_PAYMENT !== 'false';
  
  if (useMock && process.env.NODE_ENV === 'production') {
    throw new Error('[SECURITY] USE_MOCK_PAYMENT=true is NEVER allowed in production. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  
  if (useMock) {
    paymentProvider = new MockPaymentProvider();
  } else {
    paymentProvider = new RazorpayProvider();
  }
  
  return paymentProvider!;
}
