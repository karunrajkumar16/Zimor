// /src/lib/db/models/AdminUser.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { AdminUser } from '../providers/interface';

export interface AdminUserDocument extends Omit<AdminUser, 'id'>, Document {
  id: string;
}

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
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

export const AdminUserModel: Model<AdminUserDocument> =
  mongoose.models.AdminUser || mongoose.model<AdminUserDocument>('AdminUser', AdminUserSchema);
