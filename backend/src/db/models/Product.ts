// /src/lib/db/models/Product.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product } from '../../types/index.js';

export interface ProductDocument extends Omit<Product, 'id'>, Document {
  id: string;
}

const ProductColorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, default: '' },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, required: true },
    category: {
      type: String,
      enum: ['tote-bags', 'laptop-bags', 'shoulder-bags'],
      required: true,
      index: true,
    },
    categoryLabel: { type: String, required: true },
    colors: [ProductColorSchema],
    defaultColor: { type: String, required: true },
    sizes: [{ type: String }],
    stock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isComingSoon: { type: Boolean, default: false },
    averageRating: { type: Number, default: 5.0 },
    numReviews: { type: Number, default: 0 },
    images: [ProductImageSchema],
    features: [{ type: String }],
    material: [{ type: String }],
    careInstructions: [{ type: String }],
    dimensions: {
      length: { type: String, default: '' },
      height: { type: String, default: '' },
      width: { type: String, default: '' },
      strapDrop: { type: String, default: '' },
      weight: { type: String },
    },
    suitableProfessions: [{ type: String }],
    laptopCompatibility: { type: String, default: '' },
    whyYoullLoveIt: { type: String },
    strap: { type: String },
    netQuantity: { type: String },
    shippingPolicy: [{ type: String }],
    returnPolicy: [{ type: String }],
    moreInformation: {
      importedAndMarketedBy: { type: String },
      customerCare: { type: String },
      countryOfOrigin: { type: String },
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

export const ProductModel: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>('Product', ProductSchema);
