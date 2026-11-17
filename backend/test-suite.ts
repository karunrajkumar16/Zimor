import { createOrder, getOrderById } from './src/controllers/orderController.js';
import { createPaymentOrder, verifyPayment } from './src/controllers/paymentController.js';
import { login } from './src/controllers/authController.js';
import { getStats } from './src/controllers/adminController.js';
import { getProducts } from './src/controllers/productController.js';

function mockReq(body = {}, query = {}, params = {}, headers = {}) {
  return {
    body,
    query,
    params,
    headers,
  } as any;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    data: null,
    cookies: {},
    cookie(name: string, val: string) {
      this.cookies[name] = val;
      return this;
    },
    clearCookie(name: string) {
      delete this.cookies[name];
      return this;
    },
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

async function runTestSuite() {
  console.log('--- STARTING FULL BACKEND CONTROLLER TEST SUITE ---');

  // Test 1: Get Products
  {
    const req = mockReq();
    const res = mockRes();
    await getProducts(req, res);
    console.log('[TEST 1] getProducts:', res.statusCode === 200 ? 'PASS' : 'FAIL', `Found ${res.data?.products?.length} products`);
    if (res.statusCode !== 200) throw new Error('getProducts failed');
  }

  // Test 2: Create Payment Order
  let paymentOrderId = '';
  {
    const req = mockReq({
      amount: 2999,
      currency: 'INR',
      receipt: 'TEST-REC-01',
      notes: { customerName: 'Test Patron' }
    });
    const res = mockRes();
    await createPaymentOrder(req, res);
    console.log('[TEST 2] createPaymentOrder:', res.statusCode === 201 ? 'PASS' : 'FAIL', res.data?.paymentOrder?.providerOrderId);
    if (res.statusCode !== 201) throw new Error('createPaymentOrder failed');
    paymentOrderId = res.data.paymentOrder.providerOrderId;
  }

  // Test 3: Verify Payment
  {
    const req = mockReq({
      razorpayOrderId: paymentOrderId,
      razorpayPaymentId: 'pay_mock_success_123',
      razorpaySignature: 'sig_mock_valid'
    });
    const res = mockRes();
    await verifyPayment(req, res);
    console.log('[TEST 3] verifyPayment:', res.statusCode === 200 ? 'PASS' : 'FAIL', 'Verified:', res.data?.verified);
    if (res.statusCode !== 200) throw new Error('verifyPayment failed');
  }

  // Test 4: Create Order (Checkout complete submission)
  let createdOrderNumber = '';
  {
    const req = mockReq({
      items: [
        {
          productId: 'zimor-delo-tote-noir',
          productName: 'ZIMOR DELO TOTE — NOIR',
          slug: 'zimor-delo-tote-noir',
          quantity: 1,
          selectedColor: 'Noir Black',
          selectedSize: 'Medium',
          image: '/products/delo-noir-blur.jpg'
        }
      ],
      customer: {
        name: 'Aanya Verma',
        email: 'aanya@example.com',
        phone: '+91 9820011223'
      },
      shippingAddress: {
        fullName: 'Aanya Verma',
        line1: 'Penthouse 12, Altamount Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400026',
        phone: '+91 9820011223'
      },
      shippingMethod: 'Express Atelier Courier',
      promoCode: 'FIRST10',
      discount: 299,
      paymentMethod: 'UPI / QR Code',
      paymentId: paymentOrderId
    });
    const res = mockRes();
    await createOrder(req, res);
    console.log('[TEST 4] createOrder:', res.statusCode === 201 ? 'PASS' : 'FAIL', 'OrderNumber:', res.data?.order?.orderNumber, 'Total:', res.data?.order?.total);
    if (res.statusCode !== 201) throw new Error(`createOrder failed: ${JSON.stringify(res.data)}`);
    createdOrderNumber = res.data.order.orderNumber;
  }

  // Test 5: Fetch Created Order
  {
    const req = mockReq({}, {}, { id: createdOrderNumber });
    const res = mockRes();
    await getOrderById(req, res);
    console.log('[TEST 5] getOrderById:', res.statusCode === 200 ? 'PASS' : 'FAIL', 'Order:', res.data?.order?.orderNumber, 'Status:', res.data?.order?.status);
    if (res.statusCode !== 200) throw new Error('getOrderById failed');
  }

  // Test 6: Admin Login
  let adminToken = '';
  {
    const req = mockReq({
      email: 'admin@zimor.in',
      password: 'zimor_admin_2024'
    });
    const res = mockRes();
    await login(req, res);
    console.log('[TEST 6] login:', res.statusCode === 200 ? 'PASS' : 'FAIL', 'Token generated:', !!res.data?.token);
    if (res.statusCode !== 200 || !res.data?.token) throw new Error('Admin login failed');
    adminToken = res.data.token;
  }

  // Test 7: Admin Dashboard Metrics
  {
    const req = mockReq({}, {}, {}, { authorization: `Bearer ${adminToken}` });
    const res = mockRes();
    await getStats(req, res);
    console.log('[TEST 7] getStats:', res.statusCode === 200 ? 'PASS' : 'FAIL', 'Total Orders:', res.data?.stats?.metrics?.totalOrders, 'Revenue: ₹' + res.data?.stats?.metrics?.totalRevenue);
    if (res.statusCode !== 200) throw new Error('getStats failed');
  }

  console.log('--- ALL 7 BACKEND CONTROLLER TESTS PASSED WITH 100% SUCCESS ---');
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
