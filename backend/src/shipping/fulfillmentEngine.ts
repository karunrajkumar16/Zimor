/**
 * ZIMOR Orders Automated Fulfillment Pipeline Engine
 * 
 * Orchestrates:
 * 1. Fulfillment eligibility evaluation upon verified payment.
 * 2. Automated Shiprocket shipment creation (with duplicate prevention & safety lockout checks).
 * 3. Automated Courier rate calculation & AWB assignment.
 * 4. Comprehensive audit logging for both automated system and manual fallback actions.
 */

import mongoose from 'mongoose';
import { OrderModel } from '../db/models/Order.js';
import { ProductModel } from '../db/models/Product.js';
import { shiprocket } from './shiprocketService.js';
import { mockShiprocket } from './mockShiprocketProvider.js';
import { OrderAuditLog } from '../types/index.js';

export function addOrderAuditLog(
  order: any,
  actor: string,
  action: string,
  message: string,
  metadata?: any
): OrderAuditLog {
  const logEntry: OrderAuditLog = {
    timestamp: new Date().toISOString(),
    actor,
    action,
    message,
    metadata,
  };

  if (!order.auditLogs) {
    order.auditLogs = [];
  }
  order.auditLogs.push(logEntry);

  console.log(`[ZIMOR Audit] [${order.orderNumber || 'Order'}] [${actor}] [${action}]: ${message}`);
  return logEntry;
}

export interface FulfillmentExecutionResult {
  success: boolean;
  status: 'fulfilled' | 'partially_fulfilled' | 'held' | 'eligible' | 'failed' | 'already_fulfilled';
  message: string;
  orderNumber?: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: number;
  awbCode?: string;
  courierName?: string;
}

/**
 * Executes or evaluates automated fulfillment for a confirmed/paid order.
 */
export async function processOrderFulfillment(
  orderIdOrDoc: string | any,
  options?: {
    actor?: string;
    force?: boolean;
    pickupLocation?: string;
  }
): Promise<FulfillmentExecutionResult> {
  const actor = options?.actor || 'SYSTEM_AUTO_FULFILLMENT';

  // 1. Resolve order document
  let order: any;
  if (typeof orderIdOrDoc === 'string') {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdOrDoc);
    const query = isObjectId
      ? { $or: [{ _id: orderIdOrDoc }, { orderNumber: orderIdOrDoc }] }
      : { orderNumber: orderIdOrDoc };
    order = await OrderModel.findOne(query);
  } else {
    order = orderIdOrDoc;
  }

  if (!order) {
    return {
      success: false,
      status: 'failed',
      message: 'Order not found in database',
    };
  }

  // 2. Evaluate Eligibility
  const isCod =
    order.paymentMethod?.toLowerCase().includes('cash on delivery') ||
    order.paymentMethod?.toLowerCase().includes('cod');

  const isPaymentVerified = order.paymentStatus === 'Paid' || isCod;

  if (!isPaymentVerified && !options?.force) {
    order.fulfillmentStatus = 'pending_payment';
    addOrderAuditLog(
      order,
      actor,
      'FULFILLMENT_INELIGIBLE',
      `Order is not eligible for fulfillment yet. Payment status is "${order.paymentStatus}".`
    );
    await order.save();
    return {
      success: false,
      status: 'eligible',
      message: `Order payment pending (${order.paymentStatus})`,
      orderNumber: order.orderNumber,
    };
  }

  // Check if order is already cancelled or refunded
  if (order.status === 'Cancelled' || order.paymentStatus === 'Refunded') {
    order.fulfillmentStatus = 'cancelled';
    addOrderAuditLog(
      order,
      actor,
      'FULFILLMENT_HALTED',
      `Fulfillment skipped because order status is ${order.status} and payment status is ${order.paymentStatus}.`
    );
    await order.save();
    return {
      success: false,
      status: 'failed',
      message: 'Order is cancelled or refunded',
      orderNumber: order.orderNumber,
    };
  }

  // Idempotency: If already created in Shiprocket (Shipment ID exists), prevent duplicate order creation
  if (order.shiprocketShipmentId) {
    return {
      success: true,
      status: 'already_fulfilled',
      message: `Order already registered in Shiprocket (Shipment ID: ${order.shiprocketShipmentId}${order.shiprocketOrderId ? `, Order ID: ${order.shiprocketOrderId}` : ''})`,
      orderNumber: order.orderNumber,
      shiprocketShipmentId: order.shiprocketShipmentId,
      shiprocketOrderId: order.shiprocketOrderId,
      awbCode: order.awbCode,
      courierName: order.courierPartner,
    };
  }

  // 3. Mark as Fulfillment Eligible
  addOrderAuditLog(
    order,
    actor,
    'FULFILLMENT_ELIGIBILITY_CONFIRMED',
    `Verified payment received (Status: ${order.paymentStatus}, Method: ${order.paymentMethod}). Order confirmed eligible for logistics dispatch.`
  );

  // 4. Order Creation Permission Check
  if (!shiprocket.isOrderCreationEnabled()) {
    order.fulfillmentStatus = 'held';
    addOrderAuditLog(
      order,
      actor,
      'ORDER_SYNC_HELD',
      'Shiprocket order synchronization is currently disabled (SHIPROCKET_ORDER_CREATION_ENABLED=false).'
    );
    await order.save();
    return {
      success: false,
      status: 'held',
      message: 'Order creation is disabled in configuration.',
      orderNumber: order.orderNumber,
    };
  }

  // 5. Send order details to Shiprocket Production Account
  order.fulfillmentStatus = 'processing';
  addOrderAuditLog(
    order,
    actor,
    'FULFILLMENT_PROCESSING',
    'Executing automated logistics synchronization: pushing order details to Shiprocket production account.'
  );
  await order.save();

  try {
    // Determine registered pickup location
    const pickupDetails = await shiprocket.getPrimaryPickupDetails();
    const selectedPickupLocation =
      options?.pickupLocation || order.pickupLocation || pickupDetails.nickname || 'warehouse';

    // Parse product dimensions and weight
    let totalWeight = 0;
    let maxLength = 35;
    let maxBreadth = 28;
    let maxHeight = 12;
    const shipmentItems: any[] = [];

    for (const item of order.items) {
      let prod: any = null;
      if (item.productId && mongoose.Types.ObjectId.isValid(String(item.productId))) {
        prod = await ProductModel.findById(item.productId).lean();
      }
      if (!prod && item.slug) {
        prod = await ProductModel.findOne({ slug: item.slug }).lean();
      }

      const dims = shiprocket.parseProductDimensions(prod?.dimensions || (item as any).dimensions);
      const itemWeight = (item as any).weight || dims.weight;
      totalWeight += itemWeight * item.quantity;
      maxLength = Math.max(maxLength, (item as any).dimensions?.length || dims.length);
      maxBreadth = Math.max(maxBreadth, (item as any).dimensions?.breadth || dims.breadth);
      maxHeight = Math.max(maxHeight, (item as any).dimensions?.height || dims.height);

      shipmentItems.push({
        name: item.name,
        sku: `${item.slug || 'ITEM'}-${(item.color || 'STD').replace(/\s+/g, '')}`,
        units: item.quantity,
        sellingPrice: item.price,
        discount: 0,
        tax: 0,
        hsn: 4202, // 4202 = Handbags, leather cases
      });
    }

    const fullName = order.shippingAddress?.fullName || 'Customer';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const isTestPayment =
      order.paymentMode === 'test' ||
      order.isDemo ||
      String(order.paymentMethod).toLowerCase().includes('test');

    // Create order in Shiprocket (Places order under New Orders with Ship Now option)
    const shipmentResult = await shiprocket.createShipment({
      orderNumber: order.orderNumber,
      orderDate: order.date || new Date().toISOString(),
      pickupLocation: selectedPickupLocation,
      customerName: firstName,
      customerLastName: lastName,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2 || '',
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      phone: order.shippingAddress.phone,
      email: order.customerEmail || 'orders@zimorindia.com',
      items: shipmentItems,
      paymentMethod: isCod ? 'COD' : 'Prepaid',
      subtotal: order.subtotal,
      shippingCharges: order.shippingFee || 0,
      discount: order.discount || 0,
      total: order.total,
      length: maxLength,
      breadth: maxBreadth,
      height: maxHeight,
      weight: Math.max(0.5, totalWeight),
      isTestOrder: isTestPayment,
    });

    order.shiprocketOrderId = String(shipmentResult.orderId);
    order.shiprocketShipmentId = Number(shipmentResult.shipmentId);
    order.shiprocketStatus = shipmentResult.status || 'NEW';
    order.shiprocketStatusCode = shipmentResult.statusCode || 1;
    order.pickupLocation = selectedPickupLocation;
    order.status = 'Confirmed';
    order.fulfillmentStatus = 'processing';
    order.isDemoLogistics = false;
    order.shiprocketError = '';
    order.lastSyncedAt = new Date();

    addOrderAuditLog(
      order,
      actor,
      'SHIPROCKET_ORDER_SYNCED',
      `Order details successfully pushed to Shiprocket production account. Shiprocket Order ID: ${shipmentResult.orderId}, Shipment ID: ${shipmentResult.shipmentId}. Order sits in "NEW" status in Shiprocket Dashboard with "Ship Now" available for manual processing.${isTestPayment ? ' [MARKED AS TEST ORDER]' : ''}`
    );

    // Keep all shipment-related operations disabled until manually approved:
    // Do NOT automatically click Ship Now, assign AWB, book a courier, schedule pickup, or generate shipping labels.
    await order.save();

    return {
      success: true,
      status: 'fulfilled',
      message: `Order successfully pushed to Shiprocket production account (Shipment ID: ${shipmentResult.shipmentId}). Available under New Orders with 'Ship Now' option.${isTestPayment ? ' (Marked as TEST ORDER)' : ''}`,
      orderNumber: order.orderNumber,
      shiprocketShipmentId: Number(shipmentResult.shipmentId),
    };
  } catch (fulfillmentErr: any) {
    order.fulfillmentStatus = 'failed';
    order.shiprocketError = fulfillmentErr.message;
    order.lastSyncedAt = new Date();

    addOrderAuditLog(
      order,
      actor,
      'SHIPROCKET_SYNC_ERROR',
      `Failed to push order to Shiprocket: ${fulfillmentErr.message}`
    );
    await order.save();

    return {
      success: false,
      status: 'failed',
      message: fulfillmentErr.message,
      orderNumber: order.orderNumber,
    };
  }
}
