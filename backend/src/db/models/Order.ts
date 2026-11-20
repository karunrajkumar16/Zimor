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
    color: { type: String, required: true },
    size: { type: String, default: 'Standard' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
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
      enum: ['Pending', 'Paid', 'Processing', 'Confirmed', 'Dispatched', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'],
      default: 'Confirmed',
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
    isDemo: { type: Boolean, default: false, index: true },
    demoExpiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
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
