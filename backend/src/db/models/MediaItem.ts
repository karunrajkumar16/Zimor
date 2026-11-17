// /src/lib/db/models/MediaItem.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { MediaItem } from '../providers/interface';

export interface MediaItemDocument extends Omit<MediaItem, 'id'>, Document {
  id: string;
}

const MediaItemSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, index: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, default: '' },
    folder: { type: String, required: true, index: true },
    productId: { type: String },
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

export const MediaItemModel: Model<MediaItemDocument> =
  mongoose.models.MediaItem || mongoose.model<MediaItemDocument>('MediaItem', MediaItemSchema);
