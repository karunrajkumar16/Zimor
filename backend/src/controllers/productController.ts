import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';

export async function getProducts(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const { category, featured, search, published } = req.query;

    const products = await db.getProducts({
      category: category as string,
      isFeatured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      isPublished: published === 'true' ? true : published === 'false' ? false : undefined,
      search: search as string,
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.json({ products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const product = await db.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch product' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch product' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const newProduct = await db.createProduct(req.body);
    return res.status(201).json({ product: newProduct });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create product' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update product' });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
}
