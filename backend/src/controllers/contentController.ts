import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';

export async function getContent(req: Request, res: Response) {
  try {
    const { page } = req.params;
    const { section } = req.query;
    const db = await getDatabaseProvider();
    const items = await db.getContent(page, section as string);
    const content = items.length > 0 ? items[0] : null;
    return res.json({ content });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch content' });
  }
}

export async function upsertContent(req: Request, res: Response) {
  try {
    const { page } = req.params;
    const { section = 'default', data } = req.body;
    const db = await getDatabaseProvider();
    const updated = await db.upsertContent(page, section, data);
    return res.json({ content: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update content' });
  }
}
