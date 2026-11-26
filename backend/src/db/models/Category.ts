// /src/lib/db/models/Category.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Category } from '../providers/interface.js';

export interface CategoryDocument extends Omit<Category, 'id'>, Document {
  id: string;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    parentId: { type: String },
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

export const CategoryModel: Model<CategoryDocument> =
  mongoose.models.Category || mongoose.model<CategoryDocument>('Category', CategorySchema);
