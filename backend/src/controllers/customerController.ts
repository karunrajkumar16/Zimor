import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';
import { verifyCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '../auth/index.js';

export async function getCustomers(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const [customers, allOrders] = await Promise.all([
      db.getCustomers(),
      db.getOrders(),
    ]);

    const enrichedCustomers = customers.map((customer: any) => {
      const custId = customer.id || (customer._id ? customer._id.toString() : '');
      const custEmail = (customer.email || '').toLowerCase().trim();

      // Match actual genuine orders belonging to this customer
      const customerOrders = allOrders.filter((o: any) => {
        const orderCustId = o.customerId ? String(o.customerId) : '';
        const shippingEmail = o.shippingAddress?.email ? o.shippingAddress.email.toLowerCase().trim() : '';
        const orderEmail = o.customerEmail ? o.customerEmail.toLowerCase().trim() : '';
        const orderNumber = o.orderNumber ? String(o.orderNumber) : '';
        const orderId = o.id || (o._id ? o._id.toString() : '');

        const inCustomerOrdersList = Array.isArray(customer.orders) && (
          customer.orders.includes(orderNumber) ||
          customer.orders.includes(orderId)
        );

        return (
          inCustomerOrdersList ||
          (orderCustId && orderCustId === custId) ||
          (custEmail && shippingEmail && shippingEmail === custEmail) ||
          (custEmail && orderEmail && orderEmail === custEmail)
        );
      });

      // Resolved contact phone from customer profile or order shipping address
      const resolvedPhone =
        customer.phone ||
        customer.addresses?.find((a: any) => a.phone)?.phone ||
        customerOrders.find((o: any) => o.shippingAddress?.phone)?.shippingAddress.phone ||
        '';

      // Distinguish Live Mode vs Test Mode orders
      const isTestOrder = (o: any) => Boolean(
        o.isDemo ||
        o.paymentMode === 'test' ||
        (o.paymentMethod && o.paymentMethod.includes('Test')) ||
        (o.orderNumber && String(o.orderNumber).startsWith('DEMO-')) ||
        (o.orderNumber && String(o.orderNumber).startsWith('TEST-'))
      );

      // Helper to compute net captured payment (paid amount minus refunds/reversals)
      const computeNetPaid = (o: any): number => {
        if (o.status === 'Cancelled' && (!o.amountPaid || o.paymentStatus === 'Failed')) return 0;
        if (o.status === 'Failed' || o.paymentStatus === 'Failed') return 0;

        const paid = Number(
          o.amountPaid > 0
            ? o.amountPaid
            : (o.paymentStatus === 'Paid' || ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(o.status)
                ? (o.total || o.totalAmount || 0)
                : 0)
        );
        const refunded = Number(
          o.amountRefunded || (o.paymentStatus === 'Refunded' ? paid : 0)
        );
        return Math.max(0, paid - refunded);
      };

      // Live production orders (captured, non-cancelled, genuine)
      const liveOrders = customerOrders.filter(
        (o: any) =>
          !isTestOrder(o) &&
          o.status !== 'Failed' &&
          (o.paymentStatus === 'Paid' || ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(o.status))
      );
      const liveSpent = liveOrders.reduce((sum: number, o: any) => sum + computeNetPaid(o), 0);

      // Razorpay Test Mode orders (captured test mode transactions)
      const testOrders = customerOrders.filter(
        (o: any) =>
          isTestOrder(o) &&
          o.status !== 'Failed' &&
          (o.paymentStatus === 'Paid' || ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(o.status))
      );
      const testSpent = testOrders.reduce((sum: number, o: any) => sum + computeNetPaid(o), 0);

      const orderIds = customerOrders.map((o: any) => o.orderNumber || o.id || (o._id ? o._id.toString() : ''));

      return {
        ...customer,
        phone: resolvedPhone,
        orders: orderIds,
        orderCount: customerOrders.length,
        liveOrderCount: liveOrders.length,
        testOrderCount: testOrders.length,
        totalSpent: Math.round(liveSpent), // Live production spend strictly (never counts test payments as real revenue)
        liveSpent: Math.round(liveSpent),
        testSpent: Math.round(testSpent), // Test mode spending volume clearly separated
      };
    });

    const summary = {
      totalCustomers: enrichedCustomers.length,
      totalOrders: enrichedCustomers.reduce((sum: number, c: any) => sum + (c.orderCount || 0), 0),
      liveRevenue: Math.round(enrichedCustomers.reduce((sum: number, c: any) => sum + (c.liveSpent || 0), 0)),
      testVolume: Math.round(enrichedCustomers.reduce((sum: number, c: any) => sum + (c.testSpent || 0), 0)),
    };

    return res.json({ customers: enrichedCustomers, summary });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch customers' });
  }
}

export async function updateCustomerProfile(req: Request, res: Response) {
  try {
    let token = req.cookies?.[CUSTOMER_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = verifyCustomerSessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { name, phone, addresses, designation, avatar } = req.body;
    const db = await getDatabaseProvider();
    const updated = await db.createOrUpdateCustomer({
      email: session.email,
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(addresses !== undefined ? { addresses } : {}),
      ...(designation !== undefined ? { designation } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
    });

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
}
