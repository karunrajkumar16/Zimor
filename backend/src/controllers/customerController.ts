import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';
import { verifyCustomerSessionToken, CUSTOMER_COOKIE_NAME } from '../auth/index.js';

export async function getCustomers(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const customers = await db.getCustomers();
    return res.json({ customers });
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

    const { name, phone, addresses } = req.body;
    const db = await getDatabaseProvider();
    const updated = await db.createOrUpdateCustomer({
      email: session.email,
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(addresses ? { addresses } : {}),
    });

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
}
