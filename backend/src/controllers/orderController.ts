import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getDatabaseProvider } from '../db/index.js';
import { OrderModel } from '../db/models/Order.js';
import { ProductModel } from '../db/models/Product.js';
import { InventoryMovementModel } from '../db/models/InventoryMovement.js';
import { generateInvoicePdf } from '../services/invoiceService.js';
import { getPaymentProvider } from '../payments/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';
import { OrderReturnItem } from '../types/index.js';
import { calculateServerPromoDiscount } from './promotionController.js';

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

    const shipping = orderData.shipping ?? (calculatedSubtotal >= 2000 ? 0 : 250);
    const promoResult = await calculateServerPromoDiscount(orderData.promoCode, calculatedSubtotal);
    const discount = promoResult.discountAmount;
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
        const remainingStock = Math.max(0, prod.stock - item.quantity);
        await db.updateProduct(prod.id, {
          stock: remainingStock,
        });

        // Trigger inventory alert if low or depleted
        if (remainingStock <= 5) {
          createNotification({
            type: 'inventory_alert',
            title: remainingStock === 0 ? `Out of Stock: ${prod.name}` : `Low Stock Alert: ${prod.name}`,
            message: remainingStock === 0 ? `Inventory depleted (0 units remaining)` : `Only ${remainingStock} units remaining`,
            entityId: prod.id,
            entityType: 'product',
            metadata: { productId: prod.id, stock: remainingStock, slug: prod.slug },
            dedupKey: `inventory_${prod.id}_stock_${remainingStock}`,
          }).catch((err) => console.error('[Notification Trigger Error]', err));
        }
      }
    }

    // Trigger Admin Notification strictly for legitimate confirmed orders (COD or verified Paid)
    // Prevents unpaid online checkout attempts from generating spurious order_created notifications
    const isCod =
      orderData.paymentMethod?.toLowerCase().includes('cash on delivery') ||
      orderData.paymentMethod?.toLowerCase().includes('cod') ||
      order.paymentMethod?.toLowerCase().includes('cod');

    const isLegitimateOrder = isCod || order.paymentStatus === 'Paid';

    if (isLegitimateOrder) {
      createNotification({
        type: 'order_created',
        title: `New Order Received #${order.orderNumber}`,
        message: `${order.items?.[0]?.name || 'Atelier Item'} • ₹${order.total.toLocaleString('en-IN')}`,
        entityId: order.id || order.orderNumber,
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, total: order.total, customer: order.customerEmail || order.customerId },
        dedupKey: `order_${order.orderNumber}_created`,
        isDemo: Boolean((order as any).isDemo),
      }).catch((err) => console.error('[Notification Trigger Error]', err));

      if (order.paymentStatus === 'Paid') {
        createNotification({
          type: 'payment_success',
          title: `Payment Received #${order.orderNumber}`,
          message: `Payment of ₹${order.total.toLocaleString('en-IN')} confirmed for order #${order.orderNumber}`,
          entityId: order.id || order.orderNumber,
          entityType: 'payment',
          metadata: { orderNumber: order.orderNumber, total: order.total },
          dedupKey: `payment_${order.orderNumber}_success`,
          isDemo: Boolean((order as any).isDemo),
        }).catch((err) => console.error('[Notification Trigger Error]', err));
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

    // Initialize item-level return items from request or order (supports partial returns)
    const requestedItemsPayload = Array.isArray(req.body.items) && req.body.items.length > 0 ? req.body.items : null;
    let returnItems: OrderReturnItem[] = [];

    if (requestedItemsPayload) {
      for (const reqItem of requestedItemsPayload) {
        const orderItem = order.items.find(
          (oi) => oi.productId === reqItem.productId || (oi.slug && oi.slug === reqItem.slug)
        );
        if (!orderItem) continue;
        const qty = Math.min(Math.max(1, Number(reqItem.quantity) || 1), orderItem.quantity);
        returnItems.push({
          productId: orderItem.productId,
          name: orderItem.name,
          slug: orderItem.slug,
          color: orderItem.color,
          size: orderItem.size,
          quantityOrdered: orderItem.quantity,
          quantityRequested: qty,
          quantityReceived: 0,
          quantityApproved: 0,
          quantityRejected: 0,
          inspectionStatus: 'pending',
          inspectionNotes: '',
          rejectionReason: '',
          inventoryRestocked: false,
          restockedQuantity: 0,
          quarantined: false,
          quarantinedQuantity: 0,
          quarantineReason: '',
          quarantineReleasedQuantity: 0,
        });
      }
    }

    if (returnItems.length === 0) {
      // Default to all order items if no specific subset was provided
      returnItems = order.items.map((oi) => ({
        productId: oi.productId,
        name: oi.name,
        slug: oi.slug,
        color: oi.color,
        size: oi.size,
        quantityOrdered: oi.quantity,
        quantityRequested: oi.quantity,
        quantityReceived: 0,
        quantityApproved: 0,
        quantityRejected: 0,
        inspectionStatus: 'pending',
        inspectionNotes: '',
        rejectionReason: '',
        inventoryRestocked: false,
        restockedQuantity: 0,
        quarantined: false,
        quarantinedQuantity: 0,
        quarantineReason: '',
        quarantineReleasedQuantity: 0,
      }));
    }

    const totalRequestedQuantity = returnItems.reduce((acc, it) => acc + it.quantityRequested, 0);

    // Save Return Request
    order.returnRequest = {
      status: 'requested',
      type: type === 'exchange' ? 'exchange' : 'return',
      reason: reason.trim(),
      details: details.trim(),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      requestedAt: new Date(),
      items: returnItems,
      totalRequestedQuantity,
      totalRestockedQuantity: 0,
      totalQuarantinedQuantity: 0,
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

    // Trigger Admin Notification for Return Request
    createNotification({
      type: 'refund_requested',
      title: `Return Requested #${order.orderNumber}`,
      message: `Customer initiated ${type} request: "${reason.trim()}"`,
      entityId: order._id.toString(),
      entityType: 'order',
      metadata: { orderNumber: order.orderNumber, reason, type, details },
      dedupKey: `return_req_${order.orderNumber}`,
      isDemo: Boolean(order.isDemo),
    }).catch((err) => console.error('[Notification Trigger Error]', err));

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

    // Trigger Admin Notification for Return Request Review (Distinct Stage: refund_approved)
    if (newStatus === 'approved') {
      createNotification({
        type: 'refund_approved',
        title: `Return Request Approved #${order.orderNumber}`,
        message: `Return request approved by ${adminEmail}. Inspection & pickup eligible.`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, decision: 'approved', recordedReason },
        dedupKey: `return_decision_${order.orderNumber}_approved`,
        isDemo: Boolean(order.isDemo),
      }).catch((err) => console.error('[Notification Trigger Error]', err));
    } else {
      createNotification({
        type: 'return_rejected',
        title: `Return Request Rejected #${order.orderNumber}`,
        message: `Return request rejected by ${adminEmail}. Reason: ${recordedReason || 'Policy exclusion'}`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, decision: 'rejected', recordedReason },
        dedupKey: `return_decision_${order.orderNumber}_rejected`,
        isDemo: Boolean(order.isDemo),
      }).catch((err) => console.error('[Notification Trigger Error]', err));
    }

    return res.json({
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

    // Update Order state in MongoDB - Financial refund status only
    order.paymentStatus = 'Refunded';
    order.amountRefunded = refundAmount;
    order.refundId = refundResult.refundId;
    order.status = 'Returned';

    order.returnRequest = order.returnRequest || ({} as any);
    (order.returnRequest as any).status = 'completed';
    (order.returnRequest as any).refundInitiated = true;
    (order.returnRequest as any).refundId = refundResult.refundId;
    (order.returnRequest as any).refundAmount = refundAmount;

    // ARCHITECTURAL GUARANTEE: Razorpay refund processing updates only the financial refund status.
    // It does not automatically restore sellable inventory. Physical inventory is restored
    // only after the returned product has physically reached ZIMOR and passed inspection
    // via inspectAndRestockReturnedOrder. Cancelled orders without return, rejected returns,
    // and courtesy refunds never alter stock.

    order.auditLogs = order.auditLogs || [];
    order.auditLogs.push({
      timestamp: new Date().toISOString(),
      actor: adminEmail,
      action: 'REFUND_PROCESSED',
      message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} issued via Razorpay (Refund ID: ${refundResult.refundId}) by ${adminEmail}. Order status transitioned to Returned. Inventory untouched pending physical inspection.`,
      metadata: { refundId: refundResult.refundId, refundAmount, reason },
    });

    await order.save();

    // Trigger Admin Notification for Processed Refund
    createNotification({
      type: 'refund_processed',
      title: `Refund Processed ₹${refundAmount.toLocaleString('en-IN')}`,
      message: `Order #${order.orderNumber} refunded via Razorpay (ID: ${refundResult.refundId})`,
      entityId: order._id.toString(),
      entityType: 'payment',
      metadata: { orderNumber: order.orderNumber, refundId: refundResult.refundId, refundAmount },
      dedupKey: `refund_${refundResult.refundId}_processed`,
      isDemo: Boolean(order.isDemo),
    }).catch((err) => console.error('[Notification Trigger Error]', err));

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

/**
 * Admin action: Performs physical inspection of returned merchandise and conditionally
 * restores sellable product inventory with transaction/rollback guarantees and item-level
 * partial return tracking.
 *
 * Strict Guarantees:
 * 1. Atomic Restocking:
 *    - Uses a MongoDB transaction session where replica set is available.
 *    - If any DB operation fails (Product update, Movement creation, Order save), ALL operations roll back.
 *    - Optimistic concurrency guard: Checks if the target return items have already been restocked.
 *    - In standalone mode without replica sets, executes compensating rollback if any step fails.
 * 2. Partial Returns:
 *    - Tracks inspection and restocking at individual item level (returnRequest.items).
 *    - Restores ONLY the exact quantity physically received and approved as sellable.
 *    - Never restores the full original order quantity when only part of the order is returned.
 * 3. Quarantine Protection:
 *    - Products failing inspection are marked quarantined: true, quarantinedQuantity, with reason and timestamp.
 *    - Recorded as QUALITY_HOLD in InventoryMovementModel.
 *    - Sellable inventory in ProductModel is NEVER touched for quarantined units.
 */
export async function inspectAndRestockReturnedOrder(req: AuthenticatedRequest, res: Response) {
  let session: mongoose.ClientSession | null = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (sessErr: any) {
    session = null;
    useTransaction = false;
  }

  // Tracking array for non-transactional compensating rollback fallback
  const appliedIncrements: { productId: string; quantity: number }[] = [];

  try {
    const { orderNumber } = req.params;
    const { itemReceived, inspectionPassed, notes, items: inspectionItemsPayload } = req.body;
    const adminEmail = req.admin?.email || 'admin@zimorworld.com';

    const orderQuery = OrderModel.findOne({ orderNumber });
    if (useTransaction && session) {
      orderQuery.session(session);
    }
    const order = await orderQuery;

    if (!order) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (!order.returnRequest || order.returnRequest.status === 'none') {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({ error: 'No active return request exists for this order.' });
    }

    if (order.returnRequest.status === 'rejected') {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        error: 'Cannot inspect or restock: The return request for this order was rejected. Physical return is disallowed.',
      });
    }

    const isReceived = Boolean(itemReceived);
    if (!isReceived) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        error: 'Cannot restock inventory: Physical merchandise has not been confirmed received at ZIMOR atelier.',
      });
    }

    // Ensure returnRequest.items is initialized
    const returnItems: OrderReturnItem[] = (order.returnRequest.items && order.returnRequest.items.length > 0)
      ? (order.returnRequest.items as OrderReturnItem[])
      : (order.items || []).map((oi) => ({
          productId: oi.productId,
          name: oi.name,
          slug: oi.slug,
          color: oi.color,
          size: oi.size,
          quantityOrdered: oi.quantity,
          quantityRequested: oi.quantity,
          quantityReceived: 0,
          quantityApproved: 0,
          quantityRejected: 0,
          inspectionStatus: 'pending' as const,
          inspectionNotes: '',
          rejectionReason: '',
          inventoryRestocked: false,
          restockedQuantity: 0,
          quarantined: false,
          quarantinedQuantity: 0,
          quarantineReason: '',
          quarantineReleasedQuantity: 0,
        }));
    order.returnRequest.items = returnItems as any;
    order.returnRequest.totalRequestedQuantity = returnItems.reduce((acc: number, it: any) => acc + (it.quantityRequested || 0), 0);

    order.returnRequest.physicalItemReceived = true;
    order.returnRequest.physicalItemReceivedAt = new Date();
    order.returnRequest.inspectedBy = adminEmail;
    order.returnRequest.inspectedAt = new Date();
    order.returnRequest.inspectionNotes = notes || '';

    // Process each return item
    let totalNewlyRestocked = 0;
    let totalNewlyQuarantined = 0;
    const itemAuditDetails: string[] = [];

    for (const returnItem of returnItems) {
      // Find matching item payload if provided
      const itemPayload = Array.isArray(inspectionItemsPayload)
        ? inspectionItemsPayload.find(
            (ip: any) => ip.productId === returnItem.productId || (ip.slug && ip.slug === returnItem.slug)
          )
        : null;

      let itemReceivedQty = 0;
      let itemApprovedQty = 0;
      let itemRejectedQty = 0;
      let itemNotes = '';
      let itemRejectReason = '';

      if (itemPayload) {
        // Explicit item-level partial inspection payload provided
        itemReceivedQty = Math.min(
          Math.max(0, Number(itemPayload.quantityReceived) || 0),
          returnItem.quantityRequested
        );
        itemApprovedQty = Math.min(
          Math.max(0, Number(itemPayload.quantityApproved) || 0),
          itemReceivedQty
        );
        itemRejectedQty = Math.max(0, Number(itemPayload.quantityRejected) || (itemReceivedQty - itemApprovedQty));
        itemNotes = itemPayload.inspectionNotes || '';
        itemRejectReason = itemPayload.rejectionReason || '';
      } else {
        // Fallback for top-level single decision across requested items
        const isPassed = Boolean(inspectionPassed);
        itemReceivedQty = returnItem.quantityRequested;
        itemApprovedQty = isPassed ? returnItem.quantityRequested : 0;
        itemRejectedQty = isPassed ? 0 : returnItem.quantityRequested;
        itemNotes = notes || '';
        itemRejectReason = isPassed ? '' : (notes || 'Physical quality inspection failed');
      }

      returnItem.quantityReceived = itemReceivedQty;
      returnItem.quantityApproved = itemApprovedQty;
      returnItem.quantityRejected = itemRejectedQty;
      returnItem.inspectionNotes = itemNotes || returnItem.inspectionNotes || '';
      returnItem.rejectionReason = itemRejectReason || returnItem.rejectionReason || '';

      // Determine inspection status for this item
      if (itemApprovedQty === itemReceivedQty && itemReceivedQty > 0) {
        returnItem.inspectionStatus = 'passed';
      } else if (itemApprovedQty > 0) {
        returnItem.inspectionStatus = 'partially_passed';
      } else {
        returnItem.inspectionStatus = 'failed';
      }

      // Concurrency check & exact partial restock calculation
      const currentRestocked = returnItem.restockedQuantity || 0;
      const quantityToRestock = Math.max(0, itemApprovedQty - currentRestocked);

      // 1. ATOMIC RESTOCKING FOR APPROVED SELLABLE QUANTITY
      if (quantityToRestock > 0 && order.inventoryDeducted) {
        const prodQuery = ProductModel.findOneAndUpdate(
          { $or: [{ _id: returnItem.productId }, { slug: returnItem.slug }] },
          { $inc: { stock: quantityToRestock } },
          { new: true }
        );
        if (useTransaction && session) {
          prodQuery.session(session);
        }
        const updatedProduct = await prodQuery;

        if (!updatedProduct) {
          throw new Error(`Product not found for restocking: ${returnItem.name} (${returnItem.productId})`);
        }

        appliedIncrements.push({ productId: returnItem.productId, quantity: quantityToRestock });

        returnItem.restockedQuantity = currentRestocked + quantityToRestock;
        returnItem.inventoryRestocked = returnItem.restockedQuantity >= returnItem.quantityApproved;
        returnItem.restockedAt = new Date();
        totalNewlyRestocked += quantityToRestock;

        // Record RETURN_RESTOCK movement
        const movement = new InventoryMovementModel({
          productId: returnItem.productId,
          productName: returnItem.name,
          variationColor: returnItem.color,
          type: 'RETURN_RESTOCK' as const,
          quantity: quantityToRestock,
          balanceAfter: updatedProduct.stock,
          referenceOrder: order.orderNumber,
          note: `Physical return inspection passed. Restocked ${quantityToRestock} unit(s) to sellable inventory.`,
          timestamp: new Date().toISOString(),
          isDemo: Boolean(order.isDemo),
        });

        if (useTransaction && session) {
          await movement.save({ session });
        } else {
          await movement.save();
        }

        itemAuditDetails.push(
          `${returnItem.name}: ${quantityToRestock} unit(s) verified sellable & restocked`
        );
      }

      // 2. QUARANTINE PROTECTION FOR DAMAGED/REJECTED QUANTITY
      if (itemRejectedQty > 0) {
        const currentQuarantined = returnItem.quarantinedQuantity || 0;
        const newQuarantineQty = Math.max(0, itemRejectedQty - currentQuarantined);

        if (newQuarantineQty > 0) {
          returnItem.quarantined = true;
          returnItem.quarantinedQuantity = currentQuarantined + newQuarantineQty;
          returnItem.quarantinedAt = new Date();
          returnItem.quarantineReason = itemRejectReason || notes || 'Failed quality verification';
          totalNewlyQuarantined += newQuarantineQty;

          // Record QUALITY_HOLD movement (sellable stock NOT incremented!)
          const existingProduct = await ProductModel.findOne({
            $or: [{ _id: returnItem.productId }, { slug: returnItem.slug }],
          });

          const holdMovement = new InventoryMovementModel({
            productId: returnItem.productId,
            productName: returnItem.name,
            variationColor: returnItem.color,
            type: 'QUALITY_HOLD' as const,
            quantity: newQuarantineQty,
            balanceAfter: existingProduct?.stock ?? 0,
            referenceOrder: order.orderNumber,
            note: `Physical return inspection failed - quarantined ${newQuarantineQty} unit(s). Reason: ${returnItem.quarantineReason}`,
            timestamp: new Date().toISOString(),
            isDemo: Boolean(order.isDemo),
          });

          if (useTransaction && session) {
            await holdMovement.save({ session });
          } else {
            await holdMovement.save();
          }

          itemAuditDetails.push(
            `${returnItem.name}: ${newQuarantineQty} unit(s) QUARANTINED (Reason: "${returnItem.quarantineReason}")`
          );
        }
      }
    }

    // Update order-level aggregates
    const totalRestocked = returnItems.reduce((acc: number, it: any) => acc + (it.restockedQuantity || 0), 0);
    const totalQuarantined = returnItems.reduce((acc: number, it: any) => acc + (it.quarantinedQuantity || 0), 0);
    const totalRequested = order.returnRequest.totalRequestedQuantity || returnItems.reduce((acc: number, it: any) => acc + (it.quantityRequested || 0), 0);

    order.returnRequest.totalRestockedQuantity = totalRestocked;
    order.returnRequest.totalQuarantinedQuantity = totalQuarantined;

    const allItemsPassed = returnItems.every((it: any) => it.inspectionStatus === 'passed');
    const allItemsFailed = returnItems.every((it: any) => it.inspectionStatus === 'failed');

    order.returnRequest.inspectionStatus = allItemsPassed
      ? 'passed'
      : (allItemsFailed ? 'failed' : 'partially_passed');

    const allApprovedRestocked = returnItems.every(
      (it: any) => it.quantityApproved === 0 || (it.restockedQuantity || 0) >= it.quantityApproved
    );
    order.inventoryRestored = allApprovedRestocked && totalRestocked > 0;
    order.returnRequest.inventoryRestocked = order.inventoryRestored;
    if (order.inventoryRestored) {
      order.returnRequest.inventoryRestockedAt = new Date();
    }

    // Audit Log
    order.auditLogs = order.auditLogs || [];
    order.auditLogs.push({
      timestamp: new Date().toISOString(),
      actor: adminEmail,
      action: totalNewlyRestocked > 0 ? 'RETURN_INSPECTION_RESTOCKED' : 'RETURN_INSPECTION_RECORDED',
      message: `Atelier inspection by ${adminEmail}. Summary: ${totalNewlyRestocked} restocked, ${totalNewlyQuarantined} quarantined. Details: [${itemAuditDetails.join('; ')}]. Notes: "${notes || 'N/A'}"`,
      metadata: {
        totalNewlyRestocked,
        totalNewlyQuarantined,
        totalRestocked,
        totalQuarantined,
        totalRequested,
        itemAuditDetails,
      },
    });

    if (useTransaction && session) {
      await order.save({ session });
      await session.commitTransaction();
    } else {
      await order.save();
    }

    return res.json({
      success: true,
      message: `Return inspection completed: ${totalNewlyRestocked} unit(s) restocked to sellable inventory, ${totalNewlyQuarantined} unit(s) placed in quarantine.`,
      order,
    });
  } catch (err: any) {
    console.error('[Return Inspection Error]', err);

    // Rollback handling
    if (useTransaction && session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error('[Session Abort Error]', abortErr);
      }
    } else if (appliedIncrements.length > 0) {
      // Standalone compensating rollback: reverse any applied stock increments
      console.warn('[Rollback] Reversing applied stock increments due to failure...');
      for (const inc of appliedIncrements) {
        try {
          await ProductModel.findOneAndUpdate(
            { _id: inc.productId },
            { $inc: { stock: -inc.quantity } }
          );
        } catch (revErr) {
          console.error('[Compensating Rollback Error]', revErr);
        }
      }
    }

    return res.status(500).json({ error: err.message || 'Failed to process return inspection' });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

/**
 * Admin action: Explicitly authorized release or write-off of quarantined merchandise.
 *
 * Requirements:
 * - Requires admin authorization.
 * - Quarantined stock can NEVER be added to sellable inventory automatically.
 * - If action === 'restock': requires authorized justification (e.g. refurbished, cleaned, verified).
 *   Atomically increments sellable stock and decrements quarantinedQuantity.
 * - If action === 'write_off': permanently scraps the item from quarantine without increasing stock.
 * - Transactional rollback guarantees: any database failure aborts and rolls back completely.
 */
export async function releaseQuarantinedItem(req: AuthenticatedRequest, res: Response) {
  let session: mongoose.ClientSession | null = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (sessErr) {
    session = null;
    useTransaction = false;
  }

  let appliedIncrement: { productId: string; quantity: number } | null = null;

  try {
    const { orderNumber } = req.params;
    const { productId, quantity, action, reason, notes } = req.body;
    const adminEmail = req.admin?.email || 'admin@zimorworld.com';

    if (!productId) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({ error: 'productId is required.' });
    }

    if (action !== 'restock' && action !== 'write_off') {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid action: must be "restock" or "write_off".' });
    }

    if (!reason || !reason.trim()) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({ error: 'A documented authorized reason is mandatory to release quarantined stock.' });
    }

    const orderQuery = OrderModel.findOne({ orderNumber });
    if (useTransaction && session) orderQuery.session(session);
    const order = await orderQuery;

    if (!order || !order.returnRequest || !order.returnRequest.items) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(404).json({ error: 'Order or return request items not found.' });
    }

    const returnItem = order.returnRequest.items.find(
      (it) => it.productId === productId || (it.slug && it.slug === productId)
    );

    if (!returnItem) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(404).json({ error: 'Quarantined item not found on this order return request.' });
    }

    const currentQuarantined = returnItem.quarantinedQuantity || 0;
    if (currentQuarantined <= 0) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({ error: 'No quarantined units exist for this product.' });
    }

    const releaseQty = Number(quantity) > 0 ? Math.min(Number(quantity), currentQuarantined) : currentQuarantined;

    if (action === 'restock') {
      // Atomically increment sellable stock
      const prodQuery = ProductModel.findOneAndUpdate(
        { $or: [{ _id: returnItem.productId }, { slug: returnItem.slug }] },
        { $inc: { stock: releaseQty } },
        { new: true }
      );
      if (useTransaction && session) prodQuery.session(session);
      const updatedProduct = await prodQuery;

      if (!updatedProduct) {
        throw new Error(`Product not found for restocking: ${returnItem.name}`);
      }

      appliedIncrement = { productId: returnItem.productId, quantity: releaseQty };

      returnItem.quarantinedQuantity = currentQuarantined - releaseQty;
      returnItem.quarantined = returnItem.quarantinedQuantity > 0;
      returnItem.quarantineReleasedQuantity = (returnItem.quarantineReleasedQuantity || 0) + releaseQty;
      returnItem.restockedQuantity = (returnItem.restockedQuantity || 0) + releaseQty;
      returnItem.inventoryRestocked = true;

      // Record ATELIER_INWARD movement
      const inwardMovement = new InventoryMovementModel({
        productId: returnItem.productId,
        productName: returnItem.name,
        variationColor: returnItem.color,
        type: 'ATELIER_INWARD' as const,
        quantity: releaseQty,
        balanceAfter: updatedProduct.stock,
        referenceOrder: order.orderNumber,
        note: `Authorized quarantine release by ${adminEmail}: Restocked ${releaseQty} unit(s). Reason: "${reason.trim()}". Notes: "${notes || 'N/A'}"`,
        timestamp: new Date().toISOString(),
        isDemo: Boolean(order.isDemo),
      });

      if (useTransaction && session) {
        await inwardMovement.save({ session });
      } else {
        await inwardMovement.save();
      }

      order.auditLogs = order.auditLogs || [];
      order.auditLogs.push({
        timestamp: new Date().toISOString(),
        actor: adminEmail,
        action: 'QUARANTINE_RELEASED_RESTOCKED',
        message: `Authorized quarantine release by ${adminEmail} for ${returnItem.name}: ${releaseQty} unit(s) restocked to sellable inventory. Reason: "${reason.trim()}". Notes: "${notes || 'N/A'}"`,
        metadata: { productId: returnItem.productId, quantity: releaseQty, reason, notes },
      });
    } else {
      // write_off: Scrapped / written off, NOT added to sellable stock
      returnItem.quarantinedQuantity = currentQuarantined - releaseQty;
      returnItem.quarantined = returnItem.quarantinedQuantity > 0;
      returnItem.quarantineReleasedQuantity = (returnItem.quarantineReleasedQuantity || 0) + releaseQty;

      const existingProduct = await ProductModel.findOne({
        $or: [{ _id: returnItem.productId }, { slug: returnItem.slug }],
      });

      const scrapMovement = new InventoryMovementModel({
        productId: returnItem.productId,
        productName: returnItem.name,
        variationColor: returnItem.color,
        type: 'QUALITY_HOLD' as const,
        quantity: -releaseQty,
        balanceAfter: existingProduct?.stock ?? 0,
        referenceOrder: order.orderNumber,
        note: `Authorized quarantine write-off by ${adminEmail}: Disposed ${releaseQty} unit(s). Reason: "${reason.trim()}".`,
        timestamp: new Date().toISOString(),
        isDemo: Boolean(order.isDemo),
      });

      if (useTransaction && session) {
        await scrapMovement.save({ session });
      } else {
        await scrapMovement.save();
      }

      order.auditLogs = order.auditLogs || [];
      order.auditLogs.push({
        timestamp: new Date().toISOString(),
        actor: adminEmail,
        action: 'QUARANTINE_WRITTEN_OFF',
        message: `Authorized quarantine write-off by ${adminEmail} for ${returnItem.name}: ${releaseQty} unit(s) written off / disposed. Reason: "${reason.trim()}". Stock NOT increased.`,
        metadata: { productId: returnItem.productId, quantity: releaseQty, reason, notes },
      });
    }

    // Recalculate totals
    const returnItemsList = order.returnRequest.items || [];
    order.returnRequest.totalRestockedQuantity = returnItemsList.reduce((acc: number, it: any) => acc + (it.restockedQuantity || 0), 0);
    order.returnRequest.totalQuarantinedQuantity = returnItemsList.reduce((acc: number, it: any) => acc + (it.quarantinedQuantity || 0), 0);

    if (useTransaction && session) {
      await order.save({ session });
      await session.commitTransaction();
    } else {
      await order.save();
    }

    return res.json({
      success: true,
      message: action === 'restock'
        ? `Quarantine released: ${releaseQty} unit(s) of ${returnItem.name} restocked to sellable inventory.`
        : `Quarantine write-off recorded: ${releaseQty} unit(s) written off. Sellable inventory untouched.`,
      order,
    });
  } catch (err: any) {
    console.error('[Quarantine Release Error]', err);

    if (useTransaction && session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error('[Session Abort Error]', abortErr);
      }
    } else if (appliedIncrement) {
      try {
        await ProductModel.findOneAndUpdate(
          { _id: appliedIncrement.productId },
          { $inc: { stock: -appliedIncrement.quantity } }
        );
      } catch (revErr) {
        console.error('[Compensating Rollback Error]', revErr);
      }
    }

    return res.status(500).json({ error: err.message || 'Failed to release quarantined item' });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
