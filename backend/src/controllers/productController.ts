import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';
import { ProductModel } from '../db/models/Product.js';
import { createNotification } from '../services/notificationService.js';

function isSkuDuplicateError(err: any): boolean {
  return (
    err?.code === 11000 &&
    (Boolean(err.keyPattern?.sku) || Boolean(err.keyValue?.sku) || String(err.message || '').includes('sku'))
  );
}

function isSlugDuplicateError(err: any): boolean {
  return (
    err?.code === 11000 &&
    (Boolean(err.keyPattern?.slug) || Boolean(err.keyValue?.slug) || String(err.message || '').includes('slug'))
  );
}

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
    if (req.body.sku) {
      const sanitizedSku = String(req.body.sku).trim().toUpperCase();
      req.body.sku = sanitizedSku;
      const existing = await ProductModel.findOne({
        sku: { $regex: new RegExp(`^${sanitizedSku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      }).lean();
      if (existing) {
        return res.status(400).json({
          error: `Product Code (SKU) "${sanitizedSku}" is already assigned to another product.`,
        });
      }
    }
    const newProduct = await db.createProduct(req.body);
    return res.status(201).json({ product: newProduct });
  } catch (err: any) {
    if (isSkuDuplicateError(err)) {
      return res.status(400).json({
        error: `Product Code (SKU) "${req.body.sku || ''}" is already assigned to another product.`,
      });
    }
    if (isSlugDuplicateError(err)) {
      return res.status(400).json({
        error: `Product with URL slug "${req.body.slug || ''}" already exists.`,
      });
    }
    return res.status(err.status || 400).json({ error: err.message || 'Failed to create product' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const id = req.params.id;
    if (req.body.sku) {
      const sanitizedSku = String(req.body.sku).trim().toUpperCase();
      req.body.sku = sanitizedSku;
      const query: any = {
        sku: { $regex: new RegExp(`^${sanitizedSku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      };
      if (id) {
        query._id = { $ne: id };
        query.slug = { $ne: id };
      }
      const existing = await ProductModel.findOne(query).lean();
      if (existing) {
        return res.status(400).json({
          error: `Product Code (SKU) "${sanitizedSku}" is already assigned to another product.`,
        });
      }
    }
    // Fetch previous product state to detect true threshold crossing
    const previous = (await ProductModel.findById(id).lean()) || (await ProductModel.findOne({ slug: id }).lean());
    const prevStock = typeof previous?.stock === 'number' ? previous.stock : undefined;

    const updated = await db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Trigger inventory alert ONLY when crossing a threshold:
    // 1. Dropped to 0 from > 0 (Out of stock)
    // 2. Dropped to <= 5 from > 5 (Low stock threshold crossed)
    const newStock = typeof (updated as any).stock === 'number' ? (updated as any).stock : undefined;
    if (newStock !== undefined && prevStock !== undefined && newStock !== prevStock) {
      const crossedZero = prevStock > 0 && newStock === 0;
      const crossedLow = prevStock > 5 && newStock > 0 && newStock <= 5;

      if (crossedZero || crossedLow) {
        const isOutOfStock = newStock === 0;
        createNotification({
          type: 'inventory_alert',
          title: isOutOfStock ? 'Out of Stock Alert' : 'Low Stock Alert',
          message: `${(updated as any).name || 'Product'} inventory changed from ${prevStock} to ${newStock} unit${newStock === 1 ? '' : 's'}`,
          entityId: (updated as any)._id?.toString() || id,
          entityType: 'product',
          metadata: {
            productId: (updated as any)._id?.toString() || id,
            sku: (updated as any).sku,
            prevStock,
            stock: newStock,
          },
          dedupKey: `inv_${(updated as any)._id?.toString() || id}_${isOutOfStock ? 'zero' : 'low'}_${newStock}`,
          isDemo: false,
        }).catch((err) => console.error('[Notification Trigger Error]', err.message));
      }
    }

    return res.json({ product: updated });
  } catch (err: any) {
    if (isSkuDuplicateError(err)) {
      return res.status(400).json({
        error: `Product Code (SKU) "${req.body.sku || ''}" is already assigned to another product.`,
      });
    }
    if (isSlugDuplicateError(err)) {
      return res.status(400).json({
        error: `Product with URL slug "${req.body.slug || ''}" already exists.`,
      });
    }
    return res.status(err.status || 400).json({ error: err.message || 'Failed to update product' });
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
