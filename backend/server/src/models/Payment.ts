import mongoose, { Schema, Document } from 'mongoose';
import type { IPayment } from '@webdoctruyen/shared-be';

export interface PaymentDocument extends Omit<IPayment, '_id' | 'userId'>, Document {
  userId: mongoose.Types.ObjectId;
}

const paymentSchema = new Schema<PaymentDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['VND', 'USD'], default: 'VND' },
  method: {
    type: String,
    enum: ['momo', 'vnpay', 'zalopay', 'stripe', 'bank_transfer'],
    required: true,
  },
  transactionId: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  message: { type: String, default: '' },
  displayName: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  metadata: {
    gatewayResponse: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
