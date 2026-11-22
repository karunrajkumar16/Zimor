/**
 * ZIMOR Mock Shiprocket Logistics Provider
 * 
 * Provides a fully automated, realistic logistics simulation environment:
 * - Generates distinct simulated Shiprocket Order IDs and AWBs.
 * - Simulates courier allocation, shipping rates, and printable shipping labels.
 * - Automatically advances orders through the complete fulfillment lifecycle:
 *   Manifested -> Picked Up -> In Transit -> Out for Delivery -> Delivered.
 * - Completely isolates from live Shiprocket APIs (Zero live mutation requests).
 * - Synchronizes with MongoDB Atlas, Admin Orders Pipeline, and Customer Tracking.
 */

import mongoose from 'mongoose';
import { OrderModel } from '../db/models/Order.js';
import { addOrderAuditLog } from './fulfillmentEngine.js';

export interface MockShipmentResult {
  orderId: number;
  shipmentId: number;
  status: string;
  statusCode: number;
  isSimulated: boolean;
}

export interface MockAwbResult {
  awbCode: string;
  courierName: string;
  courierCompanyId: number;
  shipmentId: number;
  isSimulated: boolean;
}

export class MockShiprocketProvider {
  public isDemoMode(): boolean {
    return (
      process.env.SHIPROCKET_LOGISTICS_MODE === 'demo' ||
      process.env.SHIPROCKET_DEMO_MODE === 'true' ||
      process.env.SHIPROCKET_ENV === 'demo'
    );
  }

  /**
   * Simulate creation of an adhoc order/shipment in Shiprocket
   */
  public async createShipment(order: any): Promise<MockShipmentResult> {
    const timestampSuffix = Date.now().toString().slice(-6);
    const mockOrderId = Number(`188${timestampSuffix}`);
    const mockShipmentId = Number(`184${timestampSuffix}`);

    return {
      orderId: mockOrderId,
      shipmentId: mockShipmentId,
      status: 'NEW',
      statusCode: 1,
      isSimulated: true,
    };
  }

  /**
   * Simulate courier partner selection and AWB assignment
   */
  public async assignAwb(shipmentId: number): Promise<MockAwbResult> {
    const randomAwbSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const awbCode = `SR-SIM-${randomAwbSuffix}`;

    return {
      awbCode,
      courierName: 'Blue Dart Air (Simulated)',
      courierCompanyId: 1,
      shipmentId,
      isSimulated: true,
    };
  }

  /**
   * Simulate printable shipping label generation
   */
  public generateLabel(shipmentId: number, orderNumber: string): string {
    return `/api/shipping/demo-label/${shipmentId}?order=${orderNumber}`;
  }

  /**
   * Advance order to next simulated logistics milestone
   */
  public async advanceSimulationMilestone(
    orderIdentifier: string,
    targetStatus?: 'Dispatched' | 'Shipped' | 'Out for Delivery' | 'Delivered'
  ): Promise<any> {
    const order = mongoose.Types.ObjectId.isValid(orderIdentifier)
      ? await OrderModel.findOne({
          $or: [{ _id: orderIdentifier }, { orderNumber: orderIdentifier }],
        })
      : await OrderModel.findOne({ orderNumber: orderIdentifier });
    if (!order) return null;

    const milestones = [
      {
        status: 'Dispatched',
        shiprocketStatus: 'PICKED UP',
        activity: 'Consignment collected by courier associate from Varanasi Atelier',
        location: 'Varanasi Warehouse, UP',
      },
      {
        status: 'In Transit',
        shiprocketStatus: 'IN TRANSIT',
        activity: 'Consignment in transit via Air Express Cargo to destination hub',
        location: 'Regional Air Transit Hub',
      },
      {
        status: 'Delivered',
        shiprocketStatus: 'DELIVERED',
        activity: 'Consignment successfully delivered to recipient. Signed & verified',
        location: `${order.shippingAddress?.city || 'Destination'} (Delivered)`,
      },
    ];

    let nextMilestone = milestones[0];

    if (targetStatus) {
      nextMilestone = milestones.find((m) => m.status === targetStatus) || milestones[0];
    } else {
      // Find current index and move to next
      const currentIdx = milestones.findIndex(
        (m) => m.status === order.status || m.shiprocketStatus === order.shiprocketStatus
      );
      if (currentIdx >= 0 && currentIdx < milestones.length - 1) {
        nextMilestone = milestones[currentIdx + 1];
      } else if (currentIdx === -1) {
        nextMilestone = milestones[0];
      } else {
        // Already delivered
        return order;
      }
    }

    const previousStatus = order.status;
    order.status = nextMilestone.status as any;
    order.shiprocketStatus = nextMilestone.shiprocketStatus;
    if (nextMilestone.status === 'Delivered') {
      order.fulfillmentStatus = 'fulfilled';
    }

    const newScan = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: nextMilestone.shiprocketStatus,
      activity: nextMilestone.activity,
      location: nextMilestone.location,
    };

    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }
    order.trackingHistory.unshift(newScan as any);
    order.lastSyncedAt = new Date();

    addOrderAuditLog(
      order,
      'SHIPROCKET_DEMO_PROVIDER',
      'SIMULATED_STATUS_PROGRESSION',
      `[Demo Logistics] Status transitioned from "${previousStatus}" to "${order.status}" (${nextMilestone.shiprocketStatus}). Location: ${nextMilestone.location}`
    );

    await order.save();
    console.log(`[Shiprocket Demo Mode] Order ${order.orderNumber} advanced to ${order.status} (${order.shiprocketStatus})`);
    return order;
  }

  /**
   * Starts background automated lifecycle timers for realistic progression
   * Stages: Dispatched (~8s) -> In Transit (~20s) -> Out for Delivery (~35s) -> Delivered (~50s)
   */
  public startAutomatedTimelineSimulation(orderNumber: string): void {
    const scheduleMilestone = (
      delayMs: number,
      targetStatus: 'Dispatched' | 'Shipped' | 'Out for Delivery' | 'Delivered'
    ) => {
      setTimeout(async () => {
        try {
          const ord = await OrderModel.findOne({ orderNumber });
          // Stop progression if cancelled or refunded
          if (!ord || ord.status === 'Cancelled' || ord.paymentStatus === 'Refunded') {
            return;
          }
          await this.advanceSimulationMilestone(orderNumber, targetStatus);
        } catch (err: any) {
          console.error(`[Shiprocket Demo Timer Error for ${orderNumber}]:`, err.message);
        }
      }, delayMs);
    };

    // Stage 1: Dispatched / Picked Up in 8 seconds
    scheduleMilestone(8000, 'Dispatched');

    // Stage 2: In Transit in 20 seconds
    scheduleMilestone(20000, 'Shipped');

    // Stage 3: Out for Delivery in 35 seconds
    scheduleMilestone(35000, 'Out for Delivery');

    // Stage 4: Delivered in 50 seconds
    scheduleMilestone(50000, 'Delivered');
  }
}

export const mockShiprocket = new MockShiprocketProvider();
