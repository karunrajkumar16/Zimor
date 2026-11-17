import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';

export async function getCategories(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const categories = await db.getCategories();
    return res.json({ categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const newCategory = await db.createCategory(req.body);
    return res.status(201).json({ category: newCategory });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create category' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const updated = await db.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.json({ category: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update category' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const success = await db.deleteCategory(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
}
