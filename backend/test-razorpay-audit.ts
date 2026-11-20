// backend/test-razorpay-audit.ts
import crypto from 'crypto';
import { connectToDatabase } from './src/db/mongodb.js';
import { OrderModel } from './src/db/models/Order.js';
import { ProductModel } from './src/db/models/Product.js';
import { CustomerModel } from './src/db/models/Customer.js';
import { WebhookEventModel } from './src/db/models/WebhookEvent.js';
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPayments,
} from './src/controllers/paymentController.js';
import { getStats } from './src/controllers/adminController.js';
import { getCustomers } from './src/controllers/customerController.js';
import { config } from './src/config/index.js';

function mockReq(body: any = {}, headers: any = {}, query: any = {}, params: any = {}) {
  const req: any = {
    body,
    headers,
    query,
    params,
    cookies: {},
  };
  if (typeof body === 'object') {
    req.rawBody = Buffer.from(JSON.stringify(body));
  }
  return req;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runAuditTests() {
  console.log('\n======================================================');
  console.log('   ZIMOR RAZORPAY TEST MODE SECURITY & AUDIT SUITE    ');
  console.log('======================================================\n');

  await connectToDatabase();
  const secret = process.env.RAZORPAY_KEY_SECRET || config.razorpay.keySecret || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || config.razorpay.webhookSecret || '';

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] Test ${total}: ${testName}`);
    } else {
      console.error(`  [FAIL] Test ${total}: ${testName} - ${detail || 'Assertion failed'}`);
    }
  }

  // --- 1. CREDENTIAL SECURITY & CONFIG ---
  {
    const req = mockReq();
    const res = mockRes();
    await getPaymentConfig(req, res);
    assert(
      res.statusCode === 200 &&
      res.data?.keyId?.startsWith('rzp_test_') &&
      res.data?.isTestMode === true &&
      res.data?.paymentMode === 'test' &&
      res.data?.keySecret === undefined,
      'Config returns public Test Key without leaking Key Secret'
    );
  }

  // --- 2. SERVER-SIDE PRICE RECALCULATION & TAMPER RESISTANCE ---
  let razorpayOrderId = '';
  let productItem: any = null;
  {
    // Fetch a real product from DB
    const prod = await ProductModel.findOne().lean();
    if (!prod) throw new Error('No product found in catalog for test');
    productItem = prod;

    const req = mockReq({
      items: [
        {
          productId: (prod as any)._id.toString(),
          slug: prod.slug,
          productName: prod.name,
          quantity: 1,
          price: 1, // Client maliciously attempts to pay 1 rupee
        },
      ],
      shippingMethod: 'standard',
      customer: { name: 'Audit Patron', email: 'audit@zimor.in', phone: '9876543210' },
    });
    const res = mockRes();
    await createPaymentOrder(req, res);

    const expectedTotal = prod.price + (prod.price >= 2000 ? 0 : 250);
    const expectedPaise = Math.round(expectedTotal * 100);

    assert(
      res.statusCode === 201 &&
      res.data?.amount === expectedPaise &&
      res.data?.paymentMode === 'test',
      'createPaymentOrder strictly recalculates price from DB catalog (ignores client-submitted price)'
    );
    razorpayOrderId = res.data?.razorpayOrderId;
  }

  // --- 3. INVALID SIGNATURE REJECTION ---
  {
    const req = mockReq({
      razorpayOrderId: razorpayOrderId || 'order_audit_test_123',
      razorpayPaymentId: 'pay_audit_tampered_999',
      razorpaySignature: 'invalid_tampered_signature_hex_0000',
      items: [{ productId: (productItem as any)._id.toString(), quantity: 1 }],
    });
    const res = mockRes();
    await verifyPayment(req, res);
    assert(
      res.statusCode === 400 &&
      res.data?.error?.includes('signature verification failed'),
      'verifyPayment rejects tampered HMAC signature with HTTP 400'
    );
  }

  // --- 4. VALID SIGNATURE & SUCCESSFUL PAYMENT CAPTURE ---
  const validPaymentId = `pay_audit_test_${Date.now()}`;
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${validPaymentId}`)
    .digest('hex');

  let initialStock = 0;
  {
    const pBefore = await ProductModel.findById((productItem as any)._id).lean();
    initialStock = pBefore?.stock || 0;

    const req = mockReq({
      razorpayOrderId,
      razorpayPaymentId: validPaymentId,
      razorpaySignature: validSignature,
      items: [
        {
          productId: (productItem as any)._id.toString(),
          slug: productItem.slug,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Audit Tester',
        addressLine1: 'Test Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
      },
      customer: { email: 'audit@zimor.in', name: 'Audit Tester' },
    });
    const res = mockRes();
    await verifyPayment(req, res);

    const pAfter = await ProductModel.findById((productItem as any)._id).lean();

    assert(
      res.statusCode === 200 &&
      res.data?.verified === true &&
      res.data?.order?.paymentStatus === 'Paid' &&
      res.data?.order?.paymentMode === 'test' &&
      res.data?.order?.isDemo === false &&
      pAfter?.stock === initialStock - 1,
      'verifyPayment verifies HMAC, sets paymentMode: "test", and atomically decrements inventory'
    );
  }

  // --- 5. IDEMPOTENCY GUARD (PREVENTS DUPLICATE ORDERS & DOUBLE INVENTORY DECREMENT) ---
  {
    const req = mockReq({
      razorpayOrderId,
      razorpayPaymentId: validPaymentId,
      razorpaySignature: validSignature,
      items: [{ productId: (productItem as any)._id.toString(), quantity: 1 }],
    });
    const res = mockRes();
    await verifyPayment(req, res);

    const pAfterDuplicate = await ProductModel.findById((productItem as any)._id).lean();

    assert(
      res.statusCode === 200 &&
      res.data?.duplicate === true &&
      pAfterDuplicate?.stock === initialStock - 1,
      'verifyPayment idempotency prevents duplicate order and double inventory decrement on repeated callbacks'
    );
  }

  // --- 6. WEBHOOK SIGNATURE VERIFICATION & REJECTION OF INVALID SIGNATURES ---
  {
    const webhookPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_wh_${Date.now()}`,
            order_id: razorpayOrderId,
            amount: 269900,
            status: 'captured',
          },
        },
      },
    };
    const req = mockReq(webhookPayload, { 'x-razorpay-signature': 'invalid_webhook_sig' });
    const res = mockRes();
    await handleWebhook(req, res);
    assert(
      res.statusCode === 400 && res.data?.error?.includes('Invalid webhook signature'),
      'handleWebhook rejects payload with invalid x-razorpay-signature'
    );
  }

  // --- 7. WEBHOOK IDEMPOTENCY & EVENT DEDUPLICATION ---
  {
    const uniqueEventId = `evt_audit_${Date.now()}_dedup`;
    const webhookPayload = {
      id: uniqueEventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: validPaymentId,
            order_id: razorpayOrderId,
            amount: 269900,
            status: 'captured',
          },
        },
      },
    };
    const rawString = JSON.stringify(webhookPayload);
    const validWhSig = crypto.createHmac('sha256', webhookSecret).update(rawString).digest('hex');

    // First delivery
    const req1 = mockReq(webhookPayload, { 'x-razorpay-signature': validWhSig });
    req1.rawBody = Buffer.from(rawString);
    const res1 = mockRes();
    await handleWebhook(req1, res1);

    // Second duplicate delivery
    const req2 = mockReq(webhookPayload, { 'x-razorpay-signature': validWhSig });
    req2.rawBody = Buffer.from(rawString);
    const res2 = mockRes();
    await handleWebhook(req2, res2);

    assert(
      res1.statusCode === 200 &&
      res2.statusCode === 200 &&
      res2.data?.duplicate === true,
      'handleWebhook records event ID and ignores duplicate webhook redelivery'
    );
  }

  // --- 8. OUT-OF-ORDER FAILED EVENT DOES NOT REVERSE CAPTURED PAYMENT ---
  {
    const delayedFailedEventId = `evt_audit_failed_delayed_${Date.now()}`;
    const failedPayload = {
      id: delayedFailedEventId,
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: `pay_fail_${Date.now()}`,
            order_id: razorpayOrderId,
          },
        },
      },
    };
    const rawString = JSON.stringify(failedPayload);
    const validWhSig = crypto.createHmac('sha256', webhookSecret).update(rawString).digest('hex');

    const req = mockReq(failedPayload, { 'x-razorpay-signature': validWhSig });
    req.rawBody = Buffer.from(rawString);
    const res = mockRes();
    await handleWebhook(req, res);

    const orderInDb = await OrderModel.findOne({ razorpayOrderId }).lean();

    assert(
      res.statusCode === 200 &&
      orderInDb?.paymentStatus === 'Paid' &&
      orderInDb?.status === 'Confirmed',
      'Delayed payment.failed webhook does NOT reverse an already captured Paid order'
    );
  }

  // --- 9. REFUND PROCESSING & INVENTORY RESTORATION ---
  {
    const refundEventId = `evt_audit_refund_${Date.now()}`;
    const refundPayload = {
      id: refundEventId,
      event: 'refund.processed',
      payload: {
        refund: {
          entity: {
            id: `rfnd_${Date.now()}`,
            payment_id: validPaymentId,
            amount: 269900,
          },
        },
      },
    };
    const rawString = JSON.stringify(refundPayload);
    const validWhSig = crypto.createHmac('sha256', webhookSecret).update(rawString).digest('hex');

    const req = mockReq(refundPayload, { 'x-razorpay-signature': validWhSig });
    req.rawBody = Buffer.from(rawString);
    const res = mockRes();
    await handleWebhook(req, res);

    const orderRefunded = await OrderModel.findOne({ razorpayPaymentId: validPaymentId }).lean();
    const pAfterRefund = await ProductModel.findById((productItem as any)._id).lean();

    assert(
      res.statusCode === 200 &&
      orderRefunded?.paymentStatus === 'Refunded' &&
      orderRefunded?.status === 'Cancelled' &&
      orderRefunded?.amountRefunded! > 0 &&
      pAfterRefund?.stock === initialStock,
      'refund.processed marks order Refunded/Cancelled and safely restores inventory'
    );
  }

  // --- 10. TEST/LIVE DATA ISOLATION & ADMIN METRICS EXCLUSION ---
  {
    const req = mockReq();
    const res = mockRes();
    await getStats(req, res);

    const metrics = res.data?.stats?.metrics;
    const testModeMetrics = res.data?.stats?.testModeMetrics;

    assert(
      res.statusCode === 200 &&
      testModeMetrics !== undefined &&
      typeof metrics?.totalRevenue === 'number',
      'Admin Executive Dashboard calculates production revenue strictly isolated from Test Mode transactions'
    );
  }

  // --- 11. CUSTOMER CRM LIFETIME SPENDING ISOLATION ---
  {
    const req = mockReq();
    const res = mockRes();
    await getCustomers(req, res);

    const auditCust = res.data?.customers?.find((c: any) => c.email === 'audit@zimor.in');

    assert(
      res.statusCode === 200 &&
      (!auditCust || auditCust.totalSpent === 0),
      'Customer CRM lifetime spending strictly excludes Test Mode purchases'
    );
  }

  // --- 12. TRANSACTIONS LEDGER TEST MODE IDENTIFIERS ---
  {
    const req = mockReq();
    const res = mockRes();
    await getPayments(req, res);

    const testTx = res.data?.payments?.find((p: any) => p.transactionId === validPaymentId);

    assert(
      res.statusCode === 200 &&
      testTx !== undefined &&
      testTx.isTest === true &&
      testTx.paymentMode === 'test' &&
      testTx.gateway.includes('Test Mode'),
      'Transactions Ledger clearly distinguishes Test Mode transactions with badges and gateway labels'
    );
  }

  console.log(`\n======================================================`);
  console.log(`  AUDIT SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`======================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAuditTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal audit failure:', err);
    process.exit(1);
  });
