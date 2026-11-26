// backend/src/db/models/Promotion.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Promotion {
  id?: string;
  code: string;
  description: string;
  discountPercent: number;
  discountType: 'percentage' | 'fixed';
  discountAmount?: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  timesUsed: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionDocument extends Omit<Promotion, 'id'>, Document {
  id: string;
}

const PromotionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      default: '',
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
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

export const PromotionModel: Model<PromotionDocument> =
  mongoose.models.Promotion || mongoose.model<PromotionDocument>('Promotion', PromotionSchema);
