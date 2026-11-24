import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'order_created'
  | 'payment_success'
  | 'payment_failed'
  | 'refund_requested'
  | 'refund_approved'
  | 'refund_initiated'
  | 'refund_processed'
  | 'return_rejected'
  | 'order_cancelled'
  | 'order_returned'
  | 'shipping_dispatched'
  | 'shipping_delivered'
  | 'inventory_alert';

export interface NotificationDocument extends Document {
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: 'order' | 'product' | 'payment' | 'shipping' | 'refund';
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  dedupKey?: string;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'order_created',
        'payment_success',
        'payment_failed',
        'refund_requested',
        'refund_approved',
        'refund_initiated',
        'refund_processed',
        'return_rejected',
        'order_cancelled',
        'order_returned',
        'shipping_dispatched',
        'shipping_delivered',
        'inventory_alert',
      ],
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityId: { type: String, index: true },
    entityType: {
      type: String,
      enum: ['order', 'product', 'payment', 'shipping', 'refund'],
      default: 'order',
    },
    metadata: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    dedupKey: { type: String, unique: true, sparse: true, index: true },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const NotificationModel: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', NotificationSchema);
