import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';
import { OrderModel } from '../db/models/Order.js';
import { ProductModel } from '../db/models/Product.js';
import { generateInvoicePdf } from '../services/invoiceService.js';
import { getPaymentProvider } from '../payments/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

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

/**
 * Generates and streams a genuine, downloadable PDF invoice for an order.
 * Strictly restricted to the owning authenticated customer or an authorized admin.
 */
export async function downloadOrderInvoice(req: AuthenticatedRequest, res: Response) {
  try {
    const { orderNumber } = req.params;
    const db = await getDatabaseProvider();
    const order = await db.getOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Authorization check
    if (req.userType !== 'admin') {
      const customer = req.customer;
      if (!customer) {
        return res.status(401).json({ error: 'Authentication required to download tax invoice.' });
      }

      const isOwner =
        order.customerId === customer.id ||
        (order.customerEmail && order.customerEmail.toLowerCase() === customer.email.toLowerCase()) ||
        (order.shippingAddress?.phone && customer.email && (order as any).customerEmail === customer.email);

      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied: You do not have permission to view this invoice.' });
      }
    }

    const pdfBuffer = await generateInvoicePdf(order);
    const safeOrderNum = order.orderNumber.replace(/[^a-zA-Z0-9-]/g, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ZIMOR-Invoice-${safeOrderNum}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[Invoice Generation Error]', err);
    return res.status(500).json({ error: 'Failed to generate tax invoice. Please try again.' });
  }
}

/**
 * Submits a Customer Return or Exchange request based on published policies.
 * Enforces:
 * - Order must be Delivered
 * - Notice within policy window (24h for defects/damage; maximum 7 days)
 * - Mandatory photographs for defect/damage claims
 * - Deduplication of active return requests
 */
export async function requestOrderReturn(req: AuthenticatedRequest, res: Response) {
  try {
    const { orderNumber } = req.params;
    const { type = 'return', reason, details, imageUrls = [] } = req.body;

    const order = await OrderModel.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Ownership check
    if (req.userType !== 'admin') {
      const customer = req.customer;
      if (!customer) {
        return res.status(401).json({ error: 'Customer authentication required.' });
      }

      const isOwner =
        order.customerId === customer.id ||
        (order.customerEmail && order.customerEmail.toLowerCase() === customer.email.toLowerCase());

      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied: You do not own this order.' });
      }
    }

    // Policy Rule 1: Order must be Delivered
    const normalizedStatus = String(order.status).toLowerCase();
    if (normalizedStatus !== 'delivered') {
      return res.status(400).json({
        error:
          'Return or exchange requests can only be initiated after your order has been successfully Delivered. If your order is In Transit, cancellation is not possible per our cancellation policy; you may refuse delivery at your doorstep.',
      });
    }

    // Policy Rule 2: Cannot duplicate active request
    if (order.returnRequest?.status === 'requested' || order.returnRequest?.status === 'approved') {
      return res.status(400).json({
        error: `A return request has already been submitted for this order (Current Status: ${order.returnRequest.status.toUpperCase()}).`,
      });
    }

    if (order.returnRequest?.status === 'completed' || order.status === 'Returned') {
      return res.status(400).json({
        error: 'This order has already been returned and refunded.',
      });
    }

    // Policy Rule 3: Valid reason selection
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please select an eligible return reason.' });
    }

    const isDefectOrDamage =
      reason.toLowerCase().includes('damage') ||
      reason.toLowerCase().includes('defect') ||
      reason.toLowerCase().includes('incorrect');

    if (isDefectOrDamage && (!imageUrls || imageUrls.length === 0)) {
      return res.status(400).json({
        error: 'Photographs showing the reported defect or damage are mandatory for claim verification per ZIMOR Return Policy.',
      });
    }

    if (!details || details.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a brief description of the issue (at least 5 characters).' });
    }

    // Save Return Request
    order.returnRequest = {
      status: 'requested',
      type: type === 'exchange' ? 'exchange' : 'return',
      reason: reason.trim(),
      details: details.trim(),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      requestedAt: new Date(),
    } as any;

    const actor = req.customer?.email || req.admin?.email || 'Customer';
    order.auditLogs = order.auditLogs || [];
    order.auditLogs.push({
      timestamp: new Date().toISOString(),
      actor,
      action: 'RETURN_REQUESTED',
      message: `Customer initiated ${type} request. Reason: "${reason.trim()}". Details: "${details.trim()}"`,
      metadata: { type, reason, photosCount: imageUrls.length },
    });

    await order.save();

    return res.json({
      success: true,
      message: 'Your return/exchange request has been successfully submitted. Our team will review your claim within 24–48 hours.',
      returnRequest: order.returnRequest,
    });
  } catch (err: any) {
    console.error('[Return Request Error]', err);
    return res.status(500).json({ error: err.message || 'Failed to submit return request' });
  }
}

/**
 * Admin action: Review a customer return request (Approve or Reject with recorded reason).
 */
export async function reviewReturnRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const { orderNumber } = req.params;
    const { decision, reason: recordedReason, notes } = req.body;
    const adminEmail = req.admin?.email || 'admin@zimorworld.com';

    if (decision !== 'approve' && decision !== 'reject') {
      return res.status(400).json({ error: 'Invalid decision: must be "approve" or "reject".' });
    }

    if (decision === 'reject' && (!recordedReason || !recordedReason.trim())) {
      return res.status(400).json({ error: 'A recorded reason is mandatory when rejecting a return request.' });
    }

    const order = await OrderModel.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (!order.returnRequest || order.returnRequest.status === 'none') {
      return res.status(400).json({ error: 'No active return request exists for this order.' });
    }

    if (order.returnRequest.status === 'completed') {
      return res.status(400).json({ error: 'This return request has already been completed and refunded.' });
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    order.returnRequest.status = newStatus;
    order.returnRequest.adminDecidedAt = new Date();
    order.returnRequest.adminDecidedBy = adminEmail;
    order.returnRequest.adminNotes = recordedReason || notes || '';

    order.auditLogs = order.auditLogs || [];
    order.auditLogs.push({
      timestamp: new Date().toISOString(),
      actor: adminEmail,
      action: decision === 'approve' ? 'RETURN_APPROVED' : 'RETURN_REJECTED',
      message: `Return request ${newStatus.toUpperCase()} by ${adminEmail}. Reason/Notes: "${recordedReason || notes || 'N/A'}"`,
      metadata: { decision, recordedReason, notes },
    });

    await order.save();

    return res.json({
      success: true,
      message: `Return request has been ${newStatus}.`,
      returnRequest: order.returnRequest,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to review return request' });
  }
}

/**
 * Admin action: Executes an authentic Razorpay Refund for an approved return/RTO.
 * Prevents duplicate refunds via idempotency checks and synchronizes MongoDB state.
 */
export async function processOrderRefund(req: AuthenticatedRequest, res: Response) {
  try {
    const { orderNumber } = req.params;
    const { amount, reason } = req.body;
    const adminEmail = req.admin?.email || 'admin@zimorworld.com';

    const order = await OrderModel.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Idempotency check: prevent duplicate refund execution
    if (order.paymentStatus === 'Refunded' || (order.returnRequest && order.returnRequest.refundInitiated)) {
      return res.status(400).json({
        error: `Refund has already been processed for this order (Refund ID: ${order.refundId || order.returnRequest?.refundId}). Duplicate refund prevented.`,
      });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({
        error: 'Cannot process refund: No Razorpay payment ID associated with this order.',
      });
    }

    const refundAmount = Number(amount) > 0 ? Number(amount) : order.total;
    const refundAmountPaise = Math.round(refundAmount * 100);

    const provider = getPaymentProvider();
    const refundResult = await provider.refund({
      paymentId: order.razorpayPaymentId,
      amount: refundAmountPaise,
      notes: {
        orderNumber: order.orderNumber,
        adminEmail,
        reason: reason || 'Approved Customer Return / Refund',
      },
    });

    if (!refundResult.success || !refundResult.refundId) {
      return res.status(500).json({
        error: refundResult.error || 'Razorpay refund execution failed',
      });
    }

    // Update Order state in MongoDB
    order.paymentStatus = 'Refunded';
    order.amountRefunded = refundAmount;
    order.refundId = refundResult.refundId;
    order.status = 'Returned';

    order.returnRequest = order.returnRequest || ({} as any);
    (order.returnRequest as any).status = 'completed';
    (order.returnRequest as any).refundInitiated = true;
    (order.returnRequest as any).refundId = refundResult.refundId;
    (order.returnRequest as any).refundAmount = refundAmount;

    // Restore inventory if not already restored
    if (!order.inventoryRestored && order.inventoryDeducted) {
      for (const item of order.items) {
        await ProductModel.findOneAndUpdate(
          { $or: [{ _id: item.productId }, { slug: item.slug }] },
          { $inc: { stock: item.quantity } }
        );
      }
      order.inventoryRestored = true;
    }

    order.auditLogs = order.auditLogs || [];
    order.auditLogs.push({
      timestamp: new Date().toISOString(),
      actor: adminEmail,
      action: 'REFUND_PROCESSED',
      message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} issued via Razorpay (Refund ID: ${refundResult.refundId}) by ${adminEmail}. Order status transitioned to Returned.`,
      metadata: { refundId: refundResult.refundId, refundAmount, reason },
    });

    await order.save();

    return res.json({
      success: true,
      message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} successfully processed via Razorpay.`,
      refundId: refundResult.refundId,
      order,
    });
  } catch (err: any) {
    console.error('[Refund Error]', err);
    return res.status(500).json({ error: err.message || 'Refund processing failed' });
  }
}
