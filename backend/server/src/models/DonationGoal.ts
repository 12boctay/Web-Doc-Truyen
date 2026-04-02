import mongoose, { Schema, Document } from 'mongoose';
import type { IDonationGoal } from '@webdoctruyen/shared-be';

export interface DonationGoalDocument extends Omit<IDonationGoal, '_id'>, Document {}

const donationGoalSchema = new Schema<DonationGoalDocument>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const DonationGoal = mongoose.model<DonationGoalDocument>('DonationGoal', donationGoalSchema);
