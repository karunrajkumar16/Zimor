import mongoose, { Schema, Document, Model } from 'mongoose';

export interface WebhookEventDocument extends Document {
  eventId: string;
  eventType: string;
  payloadEntityId?: string;
  orderId?: string;
  paymentId?: string;
  status: 'processed' | 'duplicate' | 'ignored' | 'failed';
  receivedAt: Date;
}

const WebhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    payloadEntityId: { type: String },
    orderId: { type: String },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ['processed', 'duplicate', 'ignored', 'failed'],
      default: 'processed',
    },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WebhookEventModel: Model<WebhookEventDocument> =
  mongoose.models.WebhookEvent ||
  mongoose.model<WebhookEventDocument>('WebhookEvent', WebhookEventSchema);
