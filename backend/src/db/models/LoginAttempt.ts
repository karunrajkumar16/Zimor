import mongoose, { Schema, Document, Model } from 'mongoose';

export interface LoginAttemptDocument extends Document {
  key: string;
  count: number;
  firstAttempt: Date;
  lockedUntil?: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoginAttemptSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, required: true, default: 1 },
    firstAttempt: { type: Date, required: true, default: Date.now },
    lockedUntil: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export const LoginAttemptModel: Model<LoginAttemptDocument> =
  mongoose.models.LoginAttempt ||
  mongoose.model<LoginAttemptDocument>('LoginAttempt', LoginAttemptSchema);
