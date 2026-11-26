// /src/lib/db/models/SiteContent.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { SiteContent } from '../providers/interface.js';

export interface SiteContentDocument extends SiteContent, Document {}

const SiteContentSchema = new Schema(
  {
    page: { type: String, required: true, index: true },
    section: { type: String, required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

SiteContentSchema.index({ page: 1, section: 1 }, { unique: true });

export const SiteContentModel: Model<SiteContentDocument> =
  mongoose.models.SiteContent || mongoose.model<SiteContentDocument>('SiteContent', SiteContentSchema);
