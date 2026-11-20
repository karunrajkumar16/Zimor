// /src/lib/db/models/Customer.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Customer } from '../providers/interface';

export interface CustomerDocument extends Omit<Customer, 'id'>, Document {
  id: string;
}

const AddressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    addressLine1: { type: String },
    line1: { type: String },
    addressLine2: { type: String },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },
    designation: { type: String },
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String },
    authProvider: { type: String, enum: ['google', 'local'], default: 'google' },
    passwordHash: { type: String, select: false },
    addresses: [AddressSchema],
    orders: [{ type: String }],
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
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const CustomerModel: Model<CustomerDocument> =
  mongoose.models.Customer || mongoose.model<CustomerDocument>('Customer', CustomerSchema);
