// /src/db/models/Issue.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IssueDocument extends Document {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  category: 'Transit Damage' | 'Hardware Defect' | 'Size Exchange' | 'Return Request' | 'Missing Accessory';
  description: string;
  date: string;
  status: 'Open' | 'Under Review' | 'Replacement Sent' | 'Refund Issued' | 'Resolved';
  resolutionNote?: string;
  isDemo?: boolean;
  demoExpiresAt?: Date;
}

const IssueSchema = new Schema(
  {
    orderNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Transit Damage', 'Hardware Defect', 'Size Exchange', 'Return Request', 'Missing Accessory'],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'Under Review', 'Replacement Sent', 'Refund Issued', 'Resolved'],
      default: 'Open',
      index: true,
    },
    resolutionNote: { type: String, default: '' },
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

export const IssueModel: Model<IssueDocument> =
  mongoose.models.Issue || mongoose.model<IssueDocument>('Issue', IssueSchema);
