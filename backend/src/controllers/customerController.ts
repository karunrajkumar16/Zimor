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

        return (
          (orderCustId && orderCustId === custId) ||
          (custEmail && shippingEmail && shippingEmail === custEmail) ||
          (custEmail && orderEmail && orderEmail === custEmail)
        );
      });

      // Filter only confirmed/captured genuine production orders (strictly exclude Demo records, Test Mode orders, Cancelled, Failed, or Refunded)
      const validPaidOrders = customerOrders.filter(
        (o: any) =>
          !o.isDemo &&
          o.paymentMode !== 'test' &&
          !o.paymentMethod?.includes('Test') &&
          o.status !== 'Cancelled' &&
          o.status !== 'Failed' &&
          o.paymentStatus === 'Paid'
      );
      const totalSpent = validPaidOrders.reduce(
        (sum: number, o: any) =>
          sum + Math.max(0, Number(o.amountPaid || o.total || 0) - Number(o.amountRefunded || 0)),
        0
      );

      const orderIds = customerOrders.map((o: any) => o.id || o.orderNumber);

      return {
        ...customer,
        orders: orderIds,
        orderCount: customerOrders.length,
        totalSpent: Math.round(totalSpent),
      };
    });

    return res.json({ customers: enrichedCustomers });
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

    const { name, phone, addresses, designation } = req.body;
    const db = await getDatabaseProvider();
    const updated = await db.createOrUpdateCustomer({
      email: session.email,
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(addresses !== undefined ? { addresses } : {}),
      ...(designation !== undefined ? { designation } : {}),
    });

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
}
