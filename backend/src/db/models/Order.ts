// /src/lib/db/models/Order.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Order } from '../../types/index.js';

export interface OrderDocument extends Omit<Order, 'id'>, Document {
  id: string;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: '' },
    color: { type: String, required: false },
    size: { type: String, default: 'Standard' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const TrackingScanSchema = new Schema(
  {
    date: { type: String, required: true },
    status: { type: String, required: true },
    activity: { type: String, required: true },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const AuditLogSchema = new Schema(
  {
    timestamp: { type: String, required: true },
    actor: { type: String, required: true },
    action: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const ReturnItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, default: '' },
    color: { type: String },
    size: { type: String, default: 'Standard' },
    quantityOrdered: { type: Number, required: true, default: 1 },
    quantityRequested: { type: Number, required: true, default: 1 },
    quantityReceived: { type: Number, default: 0 },
    quantityApproved: { type: Number, default: 0 },
    quantityRejected: { type: Number, default: 0 },
    inspectionStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'partially_passed'],
      default: 'pending',
    },
    inspectionNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    inventoryRestocked: { type: Boolean, default: false },
    restockedQuantity: { type: Number, default: 0 },
    restockedAt: { type: Date },
    quarantined: { type: Boolean, default: false },
    quarantinedQuantity: { type: Number, default: 0 },
    quarantinedAt: { type: Date },
    quarantineReason: { type: String, default: '' },
    quarantineReleasedQuantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const ReturnRequestSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'completed'],
      default: 'none',
      index: true,
    },
    type: { type: String, enum: ['return', 'exchange'], default: 'return' },
    reason: { type: String, default: '' },
    details: { type: String, default: '' },
    imageUrls: [{ type: String }],
    requestedAt: { type: Date },
    adminNotes: { type: String, default: '' },
    adminDecidedAt: { type: Date },
    adminDecidedBy: { type: String, default: '' },
    refundInitiated: { type: Boolean, default: false },
    refundId: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
    physicalItemReceived: { type: Boolean, default: false },
    physicalItemReceivedAt: { type: Date },
    inspectionStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'partially_passed', 'not_applicable'],
      default: 'pending',
    },
    inspectedAt: { type: Date },
    inspectedBy: { type: String, default: '' },
    inspectionNotes: { type: String, default: '' },
    inventoryRestocked: { type: Boolean, default: false },
    inventoryRestockedAt: { type: Date },
    items: [ReturnItemSchema],
    totalRequestedQuantity: { type: Number, default: 0 },
    totalRestockedQuantity: { type: Number, default: 0 },
    totalQuarantinedQuantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    shippingMethod: { type: String, default: 'Complimentary Air Express' },
    paymentMethod: { type: String, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Processing', 'Confirmed', 'Dispatched', 'In Transit', 'Shipped', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed', 'Delayed', 'RTO', 'Returned'],
      default: 'Confirmed',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending_payment', 'eligible', 'processing', 'fulfilled', 'partially_fulfilled', 'failed', 'held', 'cancelled'],
      default: 'eligible',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ['test', 'live'],
      default: 'test',
      index: true,
    },
    amountPaid: { type: Number, default: 0 },
    amountRefunded: { type: Number, default: 0 },
    refundId: { type: String },
    webhookEventsProcessed: [{ type: String }],
    inventoryDeducted: { type: Boolean, default: false },
    inventoryRestored: { type: Boolean, default: false },
    razorpayOrderId: { type: String, sparse: true, index: true },
    razorpayPaymentId: { type: String, sparse: true, index: true },
    razorpaySignature: { type: String },
    promoCode: { type: String },
    trackingNumber: { type: String, default: '' },
    courierName: { type: String, default: 'BlueDart Express' },
    estimatedDelivery: { type: String, default: '' },
    customerId: { type: String, index: true },
    customerEmail: { type: String, index: true },
    returnRequest: { type: ReturnRequestSchema, default: () => ({ status: 'none' }) },
    isDemo: { type: Boolean, default: false, index: true },
    isDemoLogistics: { type: Boolean, default: false, index: true },
    demoExpiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    // Shiprocket Logistics Integration Fields
    shiprocketOrderId: { type: String, sparse: true, index: true },
    shiprocketShipmentId: { type: Number, sparse: true, index: true },
    shiprocketStatus: { type: String, default: '' },
    shiprocketStatusCode: { type: Number },
    awbCode: { type: String, sparse: true, index: true },
    courierPartner: { type: String, default: '' },
    courierCompanyId: { type: Number },
    shippingCharges: { type: Number, default: 0 },
    shippingLabelUrl: { type: String, default: '' },
    pickupLocation: { type: String, default: '' },
    trackingHistory: [TrackingScanSchema],
    lastSyncedAt: { type: Date },
    shiprocketError: { type: String, default: '' },
    auditLogs: [AuditLogSchema],
    shiprocketWebhookEventsProcessed: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const OrderModel: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);
