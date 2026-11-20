// /src/db/models/InventoryMovement.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface InventoryMovementDocument extends Document {
  id: string;
  productId: string;
  productName: string;
  variationColor: string;
  type: 'SALE_DEDUCTION' | 'RETURN_RESTOCK' | 'QUALITY_HOLD' | 'ATELIER_INWARD';
  quantity: number;
  balanceAfter: number;
  referenceOrder?: string;
  note: string;
  timestamp: string;
  isDemo?: boolean;
  demoExpiresAt?: Date;
}

const InventoryMovementSchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    variationColor: { type: String, required: true },
    type: {
      type: String,
      enum: ['SALE_DEDUCTION', 'RETURN_RESTOCK', 'QUALITY_HOLD', 'ATELIER_INWARD'],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceOrder: { type: String, default: '' },
    note: { type: String, required: true },
    timestamp: { type: String, required: true },
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

export const InventoryMovementModel: Model<InventoryMovementDocument> =
  mongoose.models.InventoryMovement ||
  mongoose.model<InventoryMovementDocument>('InventoryMovement', InventoryMovementSchema);
