// /src/lib/db/models/Review.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { CustomerReview } from '../../types/index.js';

export interface ReviewDocument extends Omit<CustomerReview, 'id'>, Document {
  id: string;
}

const ReviewSchema = new Schema(
  {
    userName: { type: String, required: true },
    userCity: { type: String, default: 'India' },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: true },
    date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    productSlug: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    media: [
      {
        type: { type: String, enum: ['photo', 'video'], default: 'photo' },
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        caption: { type: String },
      },
    ],
    helpfulCount: { type: Number, default: 0 },
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

ReviewSchema.index({ productSlug: 1, createdAt: -1 });

export const ReviewModel: Model<ReviewDocument> =
  mongoose.models.Review || mongoose.model<ReviewDocument>('Review', ReviewSchema);
