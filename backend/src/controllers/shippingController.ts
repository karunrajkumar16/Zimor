import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectToDatabase } from '../db/mongodb.js';
import { OrderModel } from '../db/models/Order.js';
import { ProductModel } from '../db/models/Product.js';
import { shiprocket } from '../shipping/shiprocketService.js';
import { mockShiprocket } from '../shipping/mockShiprocketProvider.js';
import { addOrderAuditLog, processOrderFulfillment } from '../shipping/fulfillmentEngine.js';
import { createNotification } from '../services/notificationService.js';

function getOrderQuery(orderId: string) {
  return mongoose.Types.ObjectId.isValid(orderId)
    ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
    : { orderNumber: orderId };
}

/**
 * Get Shiprocket connection, sandbox, and demo mode status
 */
export async function getConnectionStatus(_req: Request, res: Response) {
  try {
    const status = await shiprocket.checkConnection();
    const isDemo = mockShiprocket.isDemoMode();

    return res.json({
      success: true,
      ...status,
      mutationsEnabled: process.env.SHIPROCKET_MUTATIONS_ENABLED === 'true',
      authorizedTestOrder: process.env.SHIPROCKET_AUTHORIZED_TEST_ORDER || '',
      demoMode: isDemo,
      logisticsMode: isDemo ? 'demo' : 'live',
    });
  } catch (err: any) {
    const isDemo = mockShiprocket.isDemoMode();
    return res.status(500).json({
      success: false,
      connected: false,
      mutationsEnabled: process.env.SHIPROCKET_MUTATIONS_ENABLED === 'true',
      demoMode: isDemo,
      logisticsMode: isDemo ? 'demo' : 'live',
      error: err.message || 'Failed to check Shiprocket status',
    });
  }
}

/**
 * Check Courier Serviceability & Shipping Rates
 */
export async function checkServiceability(req: Request, res: Response) {
  try {
    const {
      pickupPostcode,
      deliveryPostcode,
      weight,
      cod = false,
      declaredValue,
      items,
    } = req.body;

    if (!deliveryPostcode) {
      return res.status(400).json({
        success: false,
        error: 'Delivery destination pincode is required',
      });
    }

    let originPin = pickupPostcode;
    if (!originPin) {
      const pickupDetails = await shiprocket.getPrimaryPickupDetails();
      originPin = pickupDetails.pincode || '221103';
    }

    let calculatedWeight = Number(weight) || 0.7;
    if (items && Array.isArray(items) && items.length > 0) {
      calculatedWeight = items.reduce((acc: number, it: any) => {
        const qty = Number(it.quantity || it.units) || 1;
        const w = Number(it.weight) || 0.7;
        return acc + qty * w;
      }, 0);
    }

    const result = await shiprocket.checkServiceability({
      pickupPostcode: originPin,
      deliveryPostcode: String(deliveryPostcode),
      weight: calculatedWeight,
      cod: Boolean(cod),
      declaredValue: declaredValue ? Number(declaredValue) : undefined,
    });

    return res.json({
      success: true,
      serviceable: result.serviceable,
      pickupPostcode: result.pickupPostcode,
      deliveryPostcode: result.deliveryPostcode,
      weight: calculatedWeight,
      availableCouriers: result.availableCouriers,
      recommendedCourier: result.recommendedCourier,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Serviceability check failed',
    });
  }
}

/**
 * Create Shipment in Shiprocket for an Order
 * Supports both Mock Demo Mode and Live Shiprocket execution
 */
export async function createShipmentForOrder(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;
    const { pickupLocation } = req.body;

    const order = await OrderModel.findOne(getOrderQuery(orderId));

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // 1. DEMO LOGISTICS MODE
    if (mockShiprocket.isDemoMode() || order.isDemoLogistics) {
      if (order.shiprocketShipmentId) {
        return res.status(200).json({
          success: true,
          alreadyCreated: true,
          isSimulated: true,
          message: `Simulated shipment already created (Shipment ID: ${order.shiprocketShipmentId})`,
          order,
        });
      }

      const mockShipment = await mockShiprocket.createShipment(order);
      order.shiprocketOrderId = String(mockShipment.orderId);
      order.shiprocketShipmentId = Number(mockShipment.shipmentId);
      order.shiprocketStatus = 'NEW';
      order.status = 'Processing';
      order.fulfillmentStatus = 'partially_fulfilled';
      order.isDemoLogistics = true;
      order.pickupLocation = 'Varanasi Atelier (Demo)';
      order.lastSyncedAt = new Date();
      order.shiprocketError = '';

      addOrderAuditLog(
        order,
        'ADMIN (Manual)',
        'DEMO_SHIPMENT_CREATED_MANUAL',
        `Simulated shipment created in Shiprocket Demo Mode. Shipment ID: ${mockShipment.shipmentId}, Order ID: ${mockShipment.orderId}.`
      );

      await order.save();

      return res.status(201).json({
        success: true,
        isSimulated: true,
        message: 'Simulated shipment created successfully in Demo Mode',
        order,
        shiprocketOrderId: mockShipment.orderId,
        shiprocketShipmentId: mockShipment.shipmentId,
      });
    }

    // 2. LIVE INTEGRATION CHECK: Ensure order creation is enabled
    if (!shiprocket.isOrderCreationEnabled()) {
      return res.status(403).json({
        success: false,
        error:
          'Shipment creation is currently disabled (SHIPROCKET_ORDER_CREATION_ENABLED=false).',
        isMutationsDisabled: true,
      });
    }

    // Duplicate shipment prevention
    if (order.shiprocketShipmentId) {
      return res.status(200).json({
        success: true,
        alreadyCreated: true,
        message: `Shipment already created in Shiprocket (Shipment ID: ${order.shiprocketShipmentId})`,
        order,
      });
    }

    // Payment condition verification
    const isCod =
      order.paymentMethod?.toLowerCase().includes('cash on delivery') ||
      order.paymentMethod?.toLowerCase().includes('cod');

    if (!isCod && order.paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        error: `Cannot create shipment: Payment status is "${order.paymentStatus}". Prepaid orders must be marked as Paid before dispatch.`,
      });
    }

    // Determine pickup location
    const pickupDetails = await shiprocket.getPrimaryPickupDetails();
    const selectedPickupLocation = pickupLocation || order.pickupLocation || pickupDetails.nickname || 'Primary';

    // Parse product dimensions and weight
    let totalWeight = 0;
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

      const resolvedSku = prod?.sku || item.slug || 'ITEM';

      shipmentItems.push({
        name: item.name,
        sku: resolvedSku,
        units: item.quantity,
        sellingPrice: item.price,
        discount: 0,
        tax: 0,
        hsn: 4202,
      });
    }

    // Create shipment in Shiprocket
    const fullName = order.shippingAddress?.fullName || 'Customer';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const isTestPayment =
      order.paymentMode === 'test' ||
      order.isDemo ||
      String(order.paymentMethod).toLowerCase().includes('test');

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
      length: 35,
      breadth: 28,
      height: 12,
      weight: Math.max(0.5, totalWeight),
      isTestOrder: isTestPayment,
    });

    // Update Order in MongoDB
    order.shiprocketOrderId = String(shipmentResult.orderId);
    order.shiprocketShipmentId = Number(shipmentResult.shipmentId);
    order.shiprocketStatus = shipmentResult.status || 'NEW';
    order.shiprocketStatusCode = shipmentResult.statusCode || 1;
    order.pickupLocation = selectedPickupLocation;
    order.status = 'Processing';
    order.fulfillmentStatus = order.awbCode ? 'fulfilled' : 'partially_fulfilled';
    order.lastSyncedAt = new Date();
    order.shiprocketError = '';

    addOrderAuditLog(
      order,
      'ADMIN (Manual)',
      'SHIPMENT_CREATED_MANUAL',
      `Shipment created manually by administrator in Shiprocket. Shipment ID: ${shipmentResult.shipmentId}, Order ID: ${shipmentResult.orderId}.`
    );

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully in Shiprocket',
      order,
      shiprocketOrderId: shipmentResult.orderId,
      shiprocketShipmentId: shipmentResult.shipmentId,
    });
  } catch (err: any) {
    try {
      const { orderId } = req.params;
      await OrderModel.findOneAndUpdate(
        getOrderQuery(orderId),
        { shiprocketError: err.message, lastSyncedAt: new Date() }
      );
    } catch {}

    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create shipment in Shiprocket',
    });
  }
}

/**
 * Assign Courier Partner & Generate AWB
 */
export async function assignAwbForOrder(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;
    const { courierId } = req.body;

    const order = await OrderModel.findOne(getOrderQuery(orderId));

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // 1. DEMO LOGISTICS MODE
    if (mockShiprocket.isDemoMode() || order.isDemoLogistics) {
      if (order.awbCode) {
        return res.json({
          success: true,
          alreadyAssigned: true,
          isSimulated: true,
          message: `AWB already assigned: ${order.awbCode} (${order.courierPartner})`,
          awbCode: order.awbCode,
          courierName: order.courierPartner,
          order,
        });
      }

      const mockAwb = await mockShiprocket.assignAwb(order.shiprocketShipmentId || 184001);
      order.awbCode = mockAwb.awbCode;
      order.trackingNumber = mockAwb.awbCode;
      order.courierPartner = mockAwb.courierName;
      order.courierName = mockAwb.courierName;
      order.courierCompanyId = mockAwb.courierCompanyId;
      order.shiprocketStatus = 'AWB ASSIGNED';
      order.status = 'Shipped';
      order.fulfillmentStatus = 'fulfilled';
      order.isDemoLogistics = true;
      order.shippingLabelUrl = mockShiprocket.generateLabel(order.shiprocketShipmentId || 184001, order.orderNumber);
      order.lastSyncedAt = new Date();
      order.shiprocketError = '';

      const initialScan = {
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'AWB ASSIGNED',
        activity: 'Consignment manifested and packed at Varanasi Atelier. Awaiting courier pickup.',
        location: 'Varanasi Warehouse, UP',
      };
      if (!order.trackingHistory) order.trackingHistory = [];
      order.trackingHistory = [initialScan as any];

      addOrderAuditLog(
        order,
        'ADMIN (Manual)',
        'DEMO_AWB_ASSIGNED_MANUAL',
        `Simulated AWB assigned manually: ${mockAwb.awbCode} via ${mockAwb.courierName}`
      );
      await order.save();

      createNotification({
        type: 'shipping_dispatched',
        title: 'Order Dispatched (Demo)',
        message: `Order ${order.orderNumber} assigned AWB ${mockAwb.awbCode} via ${mockAwb.courierName}`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, awb: mockAwb.awbCode, courier: mockAwb.courierName },
        dedupKey: `ship_dispatched_${order.orderNumber}_${mockAwb.awbCode}`,
        isDemo: true,
      }).catch((err) => console.error('[Notification Trigger Error]', err.message));

      // Trigger background timeline simulation
      mockShiprocket.startAutomatedTimelineSimulation(order.orderNumber);

      return res.json({
        success: true,
        isSimulated: true,
        message: 'Simulated AWB assigned successfully',
        awbCode: mockAwb.awbCode,
        courierName: mockAwb.courierName,
        order,
      });
    }

    // 2. LIVE INTEGRATION CHECK: Courier booking & AWB generation are locked for safety
    if (!shiprocket.isShipmentBookingEnabled(order.orderNumber)) {
      return res.status(403).json({
        success: false,
        error:
          'AWB assignment and courier booking are disabled for safety (SHIPROCKET_MUTATIONS_ENABLED=false). Please process "Ship Now" in the official Shiprocket Dashboard.',
        isMutationsDisabled: true,
      });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({
        success: false,
        error: 'Shipment must be created in Shiprocket before assigning an AWB',
      });
    }

    if (order.awbCode) {
      return res.json({
        success: true,
        alreadyAssigned: true,
        message: `AWB already assigned: ${order.awbCode} (${order.courierPartner})`,
        awbCode: order.awbCode,
        courierName: order.courierPartner,
        order,
      });
    }

    const awbResult = await shiprocket.assignAwb({
      shipmentId: order.shiprocketShipmentId,
      courierId: courierId ? Number(courierId) : undefined,
      orderNumber: order.orderNumber,
    });

    order.awbCode = awbResult.awbCode;
    order.trackingNumber = awbResult.awbCode;
    order.courierPartner = awbResult.courierName;
    order.courierName = awbResult.courierName;
    order.courierCompanyId = awbResult.courierCompanyId;
    order.shiprocketStatus = 'AWB ASSIGNED';
    order.status = 'Shipped';
    order.fulfillmentStatus = 'fulfilled';
    order.lastSyncedAt = new Date();
    order.shiprocketError = '';

    addOrderAuditLog(
      order,
      'ADMIN (Manual)',
      'AWB_ASSIGNED_MANUAL',
      `Air Waybill (AWB) assigned manually by administrator: ${awbResult.awbCode} via ${awbResult.courierName}. Order status moved to Shipped.`
    );

    await order.save();

    createNotification({
      type: 'shipping_dispatched',
      title: 'Order Dispatched',
      message: `Order ${order.orderNumber} dispatched via ${awbResult.courierName} (AWB: ${awbResult.awbCode})`,
      entityId: order._id.toString(),
      entityType: 'order',
      metadata: { orderNumber: order.orderNumber, awb: awbResult.awbCode, courier: awbResult.courierName },
      dedupKey: `ship_dispatched_${order.orderNumber}_${awbResult.awbCode}`,
      isDemo: Boolean(order.isDemo || order.isDemoLogistics),
    }).catch((err) => console.error('[Notification Trigger Error]', err.message));

    return res.json({
      success: true,
      message: 'AWB assigned successfully',
      awbCode: awbResult.awbCode,
      courierName: awbResult.courierName,
      courierCompanyId: awbResult.courierCompanyId,
      order,
    });
  } catch (err: any) {
    try {
      const { orderId } = req.params;
      await OrderModel.findOneAndUpdate(
        getOrderQuery(orderId),
        { shiprocketError: err.message, lastSyncedAt: new Date() }
      );
    } catch {}

    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to assign AWB in Shiprocket',
    });
  }
}

/**
 * Generate Printable Shipping Label URL
 */
export async function generateLabelForOrder(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;

    const order = await OrderModel.findOne(getOrderQuery(orderId));

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Demo Mode label URL
    if (order.isDemoLogistics || String(order.awbCode).startsWith('SR-SIM-') || mockShiprocket.isDemoMode()) {
      const labelUrl = mockShiprocket.generateLabel(order.shiprocketShipmentId || 184001, order.orderNumber);
      order.shippingLabelUrl = labelUrl;
      order.lastSyncedAt = new Date();
      await order.save();
      return res.json({
        success: true,
        labelUrl,
        labelCreated: true,
        isSimulated: true,
        order,
      });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({
        success: false,
        error: 'Shipment has not been created yet',
      });
    }

    const labelResult = await shiprocket.generateLabel(order.shiprocketShipmentId);

    if (labelResult.labelUrl) {
      order.shippingLabelUrl = labelResult.labelUrl;
      order.lastSyncedAt = new Date();
      await order.save();
    }

    return res.json({
      success: true,
      labelUrl: labelResult.labelUrl || order.shippingLabelUrl,
      labelCreated: labelResult.labelCreated,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate shipping label',
    });
  }
}

/**
 * Track shipment live & synchronize with database
 */
export async function trackOrderShipment(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;

    const order = await OrderModel.findOne(getOrderQuery(orderId));

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Demo Mode Tracking: return database scans directly
    if (order.isDemoLogistics || String(order.awbCode).startsWith('SR-SIM-')) {
      return res.json({
        success: true,
        isSimulated: true,
        tracking: {
          awb: order.awbCode || order.trackingNumber,
          currentStatus: order.shiprocketStatus || order.status,
          courierName: order.courierPartner || 'Blue Dart Air (Simulated)',
          scans: order.trackingHistory || [],
        },
        order,
      });
    }

    let tracking: any;
    if (order.awbCode || order.trackingNumber) {
      tracking = await shiprocket.trackByAwb(order.awbCode || order.trackingNumber);
    } else if (order.shiprocketShipmentId) {
      tracking = await shiprocket.trackByShipmentId(order.shiprocketShipmentId);
    } else {
      return res.json({
        success: true,
        message: 'No active shipment or AWB for this order yet',
        tracking: {
          currentStatus: order.status,
          scans: order.trackingHistory || [],
        },
        order,
      });
    }

    if (tracking) {
      order.shiprocketStatus = tracking.currentStatus || order.shiprocketStatus;
      if (tracking.currentStatusCode) {
        order.shiprocketStatusCode = tracking.currentStatusCode;
      }
      if (tracking.courierName && !order.courierPartner) {
        order.courierPartner = tracking.courierName;
        order.courierName = tracking.courierName;
      }
      if (tracking.etd) {
        order.estimatedDelivery = tracking.etd;
      }

      if (tracking.scans && Array.isArray(tracking.scans) && tracking.scans.length > 0) {
        order.trackingHistory = tracking.scans;
      }

      const upperStatus = (tracking.currentStatus || '').toUpperCase();
      if (upperStatus.includes('RTO') || upperStatus.includes('RETURN')) {
        order.status = 'Returned';
        order.fulfillmentStatus = 'failed';
      } else if (upperStatus.includes('DELIVERED') || upperStatus.includes('DELIVERY DONE')) {
        order.status = 'Delivered';
        order.fulfillmentStatus = 'fulfilled';
      } else if (
        upperStatus.includes('IN TRANSIT') ||
        upperStatus.includes('OUT FOR DELIVERY') ||
        upperStatus.includes('SHIPPED') ||
        upperStatus.includes('REACHED AT HUB') ||
        upperStatus.includes('OUT FOR HUB')
      ) {
        order.status = 'In Transit';
        order.fulfillmentStatus = 'partially_fulfilled';
      } else if (
        upperStatus.includes('PICKED UP') ||
        upperStatus.includes('PICKUP DONE') ||
        upperStatus.includes('PICKUP COMPLETED') ||
        upperStatus.includes('DISPATCHED') ||
        upperStatus.includes('MANIFEST GENERATED')
      ) {
        order.status = 'Dispatched';
        order.fulfillmentStatus = 'partially_fulfilled';
      } else if (upperStatus.includes('CANCEL')) {
        order.status = 'Cancelled';
        order.fulfillmentStatus = 'cancelled';
      }

      order.lastSyncedAt = new Date();

      addOrderAuditLog(
        order,
        'ADMIN (Manual)',
        'TRACKING_SYNCED_MANUAL',
        `Live tracking synchronized: ${order.status} (${tracking.currentStatus}). Total scans: ${tracking.scans?.length || 0}.`
      );

      await order.save();

      // Notify Admin on status milestone updates
      if (order.status === 'Delivered') {
        createNotification({
          type: 'shipping_delivered',
          title: 'Order Delivered',
          message: `Order ${order.orderNumber} confirmed delivered by ${order.courierPartner || 'Courier'}`,
          entityId: order._id.toString(),
          entityType: 'order',
          metadata: { orderNumber: order.orderNumber, status: order.status },
          dedupKey: `ship_delivered_${order.orderNumber}`,
          isDemo: Boolean(order.isDemo || order.isDemoLogistics),
        }).catch((err) => console.error('[Notification Trigger Error]', err.message));
      } else if (order.status === 'Returned') {
        createNotification({
          type: 'order_returned',
          title: 'Order Returned / RTO',
          message: `Order ${order.orderNumber} has been returned / marked RTO by courier`,
          entityId: order._id.toString(),
          entityType: 'order',
          metadata: { orderNumber: order.orderNumber, status: order.status },
          dedupKey: `ship_returned_${order.orderNumber}`,
          isDemo: Boolean(order.isDemo || order.isDemoLogistics),
        }).catch((err) => console.error('[Notification Trigger Error]', err.message));
      } else if (order.status === 'Dispatched') {
        createNotification({
          type: 'shipping_dispatched',
          title: 'Order Dispatched',
          message: `Order ${order.orderNumber} dispatched via ${order.courierPartner || 'Courier'} (AWB: ${order.awbCode || order.trackingNumber || 'N/A'})`,
          entityId: order._id.toString(),
          entityType: 'order',
          metadata: { orderNumber: order.orderNumber, status: order.status },
          dedupKey: `ship_dispatched_${order.orderNumber}_${order.awbCode || 'assigned'}`,
          isDemo: Boolean(order.isDemo || order.isDemoLogistics),
        }).catch((err) => console.error('[Notification Trigger Error]', err.message));
      }
    }

    return res.json({
      success: true,
      tracking,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to track shipment',
    });
  }
}

/**
 * Cancel Shipment in Shiprocket
 */
export async function cancelShipmentForOrder(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;

    const order = await OrderModel.findOne(getOrderQuery(orderId));

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Demo Mode cancellation
    if (order.isDemoLogistics || String(order.awbCode).startsWith('SR-SIM-')) {
      order.shiprocketStatus = 'CANCELLED';
      order.status = 'Cancelled';
      order.fulfillmentStatus = 'cancelled';
      order.lastSyncedAt = new Date();

      addOrderAuditLog(
        order,
        'ADMIN (Manual)',
        'DEMO_SHIPMENT_CANCELLED_MANUAL',
        'Simulated shipment cancelled in Demo Mode.'
      );
      await order.save();

      createNotification({
        type: 'order_cancelled',
        title: 'Shipment Cancelled (Demo)',
        message: `Simulated shipment for order ${order.orderNumber} cancelled`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber },
        dedupKey: `ship_cancel_${order.orderNumber}`,
        isDemo: true,
      }).catch((err) => console.error('[Notification Trigger Error]', err.message));

      return res.json({
        success: true,
        isSimulated: true,
        message: 'Simulated shipment cancelled successfully in Demo Mode',
        order,
      });
    }

    if (process.env.SHIPROCKET_MUTATIONS_ENABLED !== 'true') {
      return res.status(403).json({
        success: false,
        error:
          'Shipment cancellation is disabled for safety until explicitly authorized. Set SHIPROCKET_MUTATIONS_ENABLED=true in backend/.env to unlock.',
        isMutationsDisabled: true,
      });
    }

    if (order.shiprocketOrderId) {
      await shiprocket.cancelOrders([Number(order.shiprocketOrderId)]);
    }

    order.shiprocketStatus = 'CANCELLED';
    order.status = 'Cancelled';
    order.fulfillmentStatus = 'cancelled';
    order.lastSyncedAt = new Date();

    addOrderAuditLog(
      order,
      'ADMIN (Manual)',
      'SHIPMENT_CANCELLED_MANUAL',
      `Shipment cancelled in Shiprocket and order status set to Cancelled.`
    );

    await order.save();

    createNotification({
      type: 'order_cancelled',
      title: 'Shipment Cancelled',
      message: `Shipment for order ${order.orderNumber} has been cancelled in Shiprocket`,
      entityId: order._id.toString(),
      entityType: 'order',
      metadata: { orderNumber: order.orderNumber },
      dedupKey: `ship_cancel_${order.orderNumber}`,
      isDemo: Boolean(order.isDemo || order.isDemoLogistics),
    }).catch((err) => console.error('[Notification Trigger Error]', err.message));

    return res.json({
      success: true,
      message: 'Shipment cancelled successfully in Shiprocket and internal order record',
      order,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to cancel shipment',
    });
  }
}

/**
 * Retry or trigger automated fulfillment manually for an order
 */
export async function retryFulfillmentForOrder(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;

    const result = await processOrderFulfillment(orderId, {
      actor: 'ADMIN (Manual Trigger)',
      force: true,
    });

    const order = await OrderModel.findOne(getOrderQuery(orderId));

    return res.json({
      success: result.success,
      result,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to retry fulfillment',
    });
  }
}

/**
 * Advance Demo Order Tracking Milestone
 */
export async function advanceDemoMilestone(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { orderId } = req.params;
    const { targetStatus } = req.body;

    const order = await OrderModel.findOne(getOrderQuery(orderId));
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updated = await mockShiprocket.advanceSimulationMilestone(order.orderNumber, targetStatus);
    return res.json({
      success: true,
      message: `Simulated order advanced to ${updated.status} (${updated.shiprocketStatus})`,
      order: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Render HTML Shipping Label for Demo Shipments
 */
export async function renderDemoShippingLabel(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { shipmentId } = req.params;
    const orderNumber = req.query.order as string;

    const query = orderNumber ? { orderNumber } : { shiprocketShipmentId: Number(shipmentId) };
    const order = await OrderModel.findOne(query).lean();

    const orderNum = order?.orderNumber || `ZMR-${shipmentId}`;
    const awb = order?.awbCode || `SR-SIM-${shipmentId}`;
    const consignee = order?.shippingAddress?.fullName || 'Valued Customer';
    const address = order?.shippingAddress
      ? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + ', ' : ''}${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
      : 'Bandra West, Mumbai - 400050';
    const phone = order?.shippingAddress?.phone || '+91 98765 43210';
    const courier = order?.courierPartner || 'Blue Dart Air (Simulated)';
    const date = order?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ZIMOR Shipping Label - ${orderNum}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f4f4; padding: 20px; display: flex; justify-content: center; }
    .label { width: 380px; background: #fff; border: 2px solid #000; padding: 20px; box-sizing: border-box; }
    .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
    .badge { font-size: 9px; font-weight: bold; padding: 2px 6px; border: 1px solid #000; text-transform: uppercase; background: #fdfaf6; }
    .awb-box { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
    .awb-code { font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 3px; }
    .barcode { height: 35px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px); margin: 8px 0; }
    .section { font-size: 11px; margin-bottom: 10px; line-height: 1.4; }
    .title { font-weight: bold; text-transform: uppercase; font-size: 10px; color: #555; }
    .footer { border-top: 1px solid #000; pt: 8px; font-size: 9px; display: flex; justify-content: space-between; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="label">
    <div class="header">
      <div class="logo">ZIMOR</div>
      <div class="badge">Air Express (Prepaid)</div>
    </div>
    <div class="awb-box">
      <div class="title">Air Waybill (AWB)</div>
      <div class="barcode"></div>
      <div class="awb-code">${awb}</div>
      <div style="font-size: 11px; margin-top: 4px;">Carrier: <strong>${courier}</strong> • Routed via Shiprocket Logistics</div>
    </div>
    <div class="section">
      <div class="title">Deliver To (Consignee):</div>
      <div style="font-size: 13px; font-weight: bold;">${consignee}</div>
      <div>${address}</div>
      <div>Phone: ${phone}</div>
    </div>
    <div class="section">
      <div class="title">Shipped From (Atelier Origin):</div>
      <div>ZIMOR Luxury Creations Pvt. Ltd.</div>
      <div>Plot 14, Varanasi Industrial Corridor, Varanasi, UP - 221103</div>
    </div>
    <div class="section" style="border-top: 1px dashed #ccc; padding-top: 6px;">
      <div style="display: flex; justify-content: space-between;">
        <span>Order #: <strong>${orderNum}</strong></span>
        <span>Date: ${date}</span>
      </div>
      <div>Total Declared Value: <strong>₹${order?.total ? order.total.toLocaleString('en-IN') : '2,699'} (PAID)</strong></div>
    </div>
    <div class="footer">
      <span>Official Shipping Documentation</span>
      <span>Shipment ID: ${shipmentId}</span>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err: any) {
    return res.status(500).send(`Error rendering label: ${err.message}`);
  }
}

/**
 * Shiprocket Webhook Ingestion
 */
export async function handleShiprocketWebhook(req: Request, res: Response) {
  const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  const incomingKey = req.headers['x-api-key'];

  if (!webhookToken) {
    console.warn('[Shiprocket Webhook] Server webhook token not configured in SHIPROCKET_WEBHOOK_TOKEN');
    return res.status(500).json({ error: 'Server webhook authentication unconfigured' });
  }

  if (!incomingKey || typeof incomingKey !== 'string') {
    console.warn('[Shiprocket Webhook] Rejected: Missing or invalid x-api-key header');
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-api-key header' });
  }

  const tokenBuf = Buffer.from(webhookToken, 'utf8');
  const keyBuf = Buffer.from(incomingKey, 'utf8');

  // Strict buffer length check before timingSafeEqual to avoid RangeError exception
  if (tokenBuf.length === 0 || keyBuf.length === 0 || tokenBuf.length !== keyBuf.length) {
    console.warn('[Shiprocket Webhook] Rejected: Key length mismatch');
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-api-key header' });
  }

  if (!crypto.timingSafeEqual(tokenBuf, keyBuf)) {
    console.warn('[Shiprocket Webhook] Rejected: Key content mismatch');
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-api-key header' });
  }

  res.status(200).json({ status: 'ok', received: true });

  try {
    await connectToDatabase();
    const payload = req.body;
    const awb = payload?.awb || payload?.awb_code;
    const shipmentId = payload?.shipment_id;
    const orderNumber = payload?.order_id;
    const currentStatus = payload?.current_status || payload?.shipment_status;
    const scans = payload?.scans || [];

    if (!awb && !shipmentId && !orderNumber) {
      console.warn('[Shiprocket Webhook] Ignored: Missing shipment identifiers');
      return;
    }

    const matchingConditions: any[] = [];
    if (awb) {
      matchingConditions.push({ awbCode: String(awb).trim() }, { trackingNumber: String(awb).trim() });
    }
    if (shipmentId) {
      matchingConditions.push({ shiprocketShipmentId: Number(shipmentId) });
    }
    if (orderNumber) {
      matchingConditions.push({ shiprocketOrderId: String(orderNumber).trim() });
      matchingConditions.push({
        orderNumber: String(orderNumber).trim(),
        shiprocketShipmentId: { $exists: true, $ne: null },
      });
    }

    const order = await OrderModel.findOne({ $or: matchingConditions });

    if (!order) {
      console.warn('[Shiprocket Webhook] No registered Shiprocket order found matching identifiers:', { awb, shipmentId, orderNumber });
      return;
    }

    // Security: Test/Demo isolation
    const isPayloadTest = Boolean(payload?.is_test || payload?.test || (orderNumber && String(orderNumber).startsWith('DEMO-')));
    if (isPayloadTest && !order.isDemo && order.paymentMode !== 'test' && !order.isDemoLogistics) {
      console.warn('[Shiprocket Webhook] Prevented test payload from mutating genuine production order:', order.orderNumber);
      return;
    }

    // Webhook Deduplication Guard
    const eventId =
      payload?.event_id ||
      payload?.id ||
      (req.headers['x-shiprocket-event-id'] as string) ||
      `${awb || shipmentId || orderNumber}_${currentStatus}_${payload?.current_timestamp || (scans[0] ? scans[0].date : '')}`;

    if (order.shiprocketWebhookEventsProcessed && order.shiprocketWebhookEventsProcessed.includes(String(eventId))) {
      console.log(`[Shiprocket Webhook] Duplicate event ignored (Event ID: ${eventId}) for order ${order.orderNumber}`);
      return;
    }

    if (!order.shiprocketWebhookEventsProcessed) {
      order.shiprocketWebhookEventsProcessed = [];
    }
    order.shiprocketWebhookEventsProcessed.push(String(eventId));

    if (currentStatus) {
      order.shiprocketStatus = currentStatus;
    }

    if (payload?.courier_name && !order.courierPartner) {
      order.courierPartner = payload.courier_name;
      order.courierName = payload.courier_name;
    }

    // Idempotent scan merging
    if (scans && Array.isArray(scans) && scans.length > 0) {
      const existingScans = order.trackingHistory || [];
      const existingKeys = new Set(existingScans.map((s) => `${s.date}_${s.activity}`));

      const newScans = scans
        .filter((s: any) => !existingKeys.has(`${s.date}_${s.activity || s.location}`))
        .map((s: any) => ({
          date: s.date || new Date().toISOString(),
          status: s.status || currentStatus || 'UPDATE',
          activity: s.activity || s.location || 'In transit',
          location: s.location || '',
        }));

      if (newScans.length > 0) {
        order.trackingHistory = [...newScans, ...existingScans];
      }
    }

    const statusUpper = (currentStatus || '').toUpperCase();
    const previousStatus = order.status;

    if (statusUpper.includes('RTO') || statusUpper.includes('RETURN')) {
      order.status = 'Returned';
      order.fulfillmentStatus = 'failed';
    } else if (statusUpper.includes('DELIVERED') || statusUpper.includes('DELIVERY DONE')) {
      order.status = 'Delivered';
      order.fulfillmentStatus = 'fulfilled';
    } else if (
      statusUpper.includes('IN TRANSIT') ||
      statusUpper.includes('OUT FOR DELIVERY') ||
      statusUpper.includes('SHIPPED') ||
      statusUpper.includes('REACHED AT HUB') ||
      statusUpper.includes('OUT FOR HUB')
    ) {
      order.status = 'In Transit';
      order.fulfillmentStatus = 'partially_fulfilled';
    } else if (
      statusUpper.includes('PICKED UP') ||
      statusUpper.includes('PICKUP DONE') ||
      statusUpper.includes('PICKUP COMPLETED') ||
      statusUpper.includes('DISPATCHED') ||
      statusUpper.includes('MANIFEST GENERATED')
    ) {
      order.status = 'Dispatched';
      order.fulfillmentStatus = 'partially_fulfilled';
    } else if (statusUpper.includes('CANCEL')) {
      order.status = 'Cancelled';
      order.fulfillmentStatus = 'cancelled';
    }

    order.lastSyncedAt = new Date();

    addOrderAuditLog(
      order,
      'SHIPROCKET_WEBHOOK',
      'STATUS_SYNC_WEBHOOK',
      `Shiprocket webhook event received: status updated from "${previousStatus}" to "${order.status}" (${currentStatus}). Courier: ${order.courierPartner || payload?.courier_name || 'N/A'}. Event ID: ${eventId}.`
    );

    await order.save();

    // Trigger Admin Notification based on verified status transition
    if (order.status === 'Delivered' && previousStatus !== 'Delivered') {
      createNotification({
        type: 'shipping_delivered',
        title: 'Order Delivered',
        message: `Order ${order.orderNumber} confirmed delivered via Shiprocket`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, awb, courier: order.courierPartner },
        dedupKey: `ship_delivered_${order.orderNumber}`,
        isDemo: Boolean(order.isDemo || order.isDemoLogistics),
      }).catch((err) => console.error('[Notification Trigger Error]', err.message));
    } else if (order.status === 'Returned' && previousStatus !== 'Returned') {
      createNotification({
        type: 'order_returned',
        title: 'Return / RTO Alert',
        message: `Order ${order.orderNumber} marked as Returned/RTO by courier`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, awb, courier: order.courierPartner },
        dedupKey: `ship_returned_${order.orderNumber}`,
        isDemo: Boolean(order.isDemo || order.isDemoLogistics),
      }).catch((err) => console.error('[Notification Trigger Error]', err.message));
    } else if ((order.status === 'Dispatched' || order.status === 'In Transit') && previousStatus === 'Confirmed') {
      createNotification({
        type: 'shipping_dispatched',
        title: 'Order Dispatched',
        message: `Order ${order.orderNumber} picked up/dispatched (${currentStatus})`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, awb, courier: order.courierPartner },
        dedupKey: `ship_dispatched_${order.orderNumber}_${awb || 'assigned'}`,
        isDemo: Boolean(order.isDemo || order.isDemoLogistics),
      }).catch((err) => console.error('[Notification Trigger Error]', err.message));
    } else if (order.status === 'Cancelled' && previousStatus !== 'Cancelled') {
      createNotification({
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Shipment for order ${order.orderNumber} cancelled in Shiprocket`,
        entityId: order._id.toString(),
        entityType: 'order',
        metadata: { orderNumber: order.orderNumber, awb },
        dedupKey: `ship_cancelled_${order.orderNumber}`,
        isDemo: Boolean(order.isDemo || order.isDemoLogistics),
      }).catch((err) => console.error('[Notification Trigger Error]', err.message));
    }

    console.log(`[Shiprocket Webhook] Order ${order.orderNumber} successfully updated to status: ${order.status} (${order.shiprocketStatus})`);
  } catch (err: any) {
    console.error('[Shiprocket Webhook Processing Error]:', err.message);
  }
}
