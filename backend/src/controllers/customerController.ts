import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';

export async function getCustomers(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const customers = await db.getCustomers();
    return res.json({ customers });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch customers' });
  }
}
