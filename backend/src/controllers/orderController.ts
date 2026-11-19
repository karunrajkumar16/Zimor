import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';

export async function getOrders(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const { status, customerId } = req.query;
    const orders = await db.getOrders({
      status: status as string,
      customerId: customerId as string,
    });
    return res.json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch order' });
  }
}

export async function trackOrder(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const { orderNumber, email } = req.query;

    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required' });
    }

    const order = await db.getOrderByNumber(orderNumber as string);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (email && order.shippingAddress?.phone) {
      // Optional check if user wants strict email verification
    }

    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to track order' });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const orderData = req.body;

    // Server-side validation of products and price calculation
    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of orderData.items) {
      const product =
        (await db.getProductById(item.productId)) ||
        (await db.getProductBySlug(item.slug || item.productId));

      if (!product) {
        return res.status(400).json({ success: false, error: `Product ${item.productName || item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      calculatedSubtotal += product.price * item.quantity;
      validatedItems.push({
        ...item,
        productId: product.id,
        price: product.price,
        productName: product.name,
        slug: product.slug,
        image: product.images[0]?.url || item.image,
      });
    }

    const shipping = orderData.shipping ?? (calculatedSubtotal > 2000 ? 0 : 250);
    const discount = orderData.discount ?? 0;
    const finalTotal = Math.max(0, calculatedSubtotal + shipping - discount);

    const order = await db.createOrder({
      ...orderData,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shipping,
      discount,
      total: finalTotal,
    });

    // Deduct inventory
    for (const item of validatedItems) {
      const prod = await db.getProductById(item.productId);
      if (prod) {
        await db.updateProduct(prod.id, {
          stock: Math.max(0, prod.stock - item.quantity),
        });
      }
    }

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to create order' });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const db = await getDatabaseProvider();
    const { status, trackingNumber, courierName } = req.body;
    const updated = await db.updateOrderStatus(req.params.id, status, { trackingNumber, courierName });
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ order: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
}
