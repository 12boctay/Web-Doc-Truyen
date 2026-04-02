import { Payment } from '../models/Payment';
import { User } from '../models/User';
import mongoose from 'mongoose';
import type { PaymentMethod } from '@webdoctruyen/shared-be';

// Badge thresholds in VND
const BADGE_THRESHOLDS = [
  { min: 2_000_000, badge: 'diamond' },
  { min: 1_000_000, badge: 'gold' },
  { min: 500_000, badge: 'silver' },
  { min: 100_000, badge: 'bronze' },
] as const;

function calculateBadge(totalDonated: number): string {
  for (const t of BADGE_THRESHOLDS) {
    if (totalDonated >= t.min) return t.badge;
  }
  return 'none';
}

interface CreatePaymentInput {
  userId: string;
  amount: number;
  method: PaymentMethod;
  message?: string;
  displayName?: string;
  isAnonymous?: boolean;
  donationGoalId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createPayment(input: CreatePaymentInput) {
  const payment = await Payment.create({
    userId: new mongoose.Types.ObjectId(input.userId),
    amount: input.amount,
    currency: 'VND',
    method: input.method,
    status: 'pending',
    message: input.message || '',
    displayName: input.displayName || '',
    isAnonymous: input.isAnonymous || false,
    metadata: {
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });

  return payment;
}

export async function completePayment(paymentId: string, transactionId?: string, gatewayResponse?: any) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw { status: 404, message: 'Payment not found' };
  if (payment.status !== 'pending') throw { status: 400, message: 'Payment already processed' };

  payment.status = 'completed';
  payment.completedAt = new Date();
  if (transactionId) payment.transactionId = transactionId;
  if (gatewayResponse) payment.metadata.gatewayResponse = gatewayResponse;
  await payment.save();

  // Update user's totalDonated and badge
  const user = await User.findById(payment.userId);
  if (user) {
    user.totalDonated = (user.totalDonated || 0) + payment.amount;
    user.donorBadge = calculateBadge(user.totalDonated) as any;
    await user.save();
  }

  return payment;
}

export async function failPayment(paymentId: string, gatewayResponse?: any) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw { status: 404, message: 'Payment not found' };

  payment.status = 'failed';
  if (gatewayResponse) payment.metadata.gatewayResponse = gatewayResponse;
  await payment.save();
  return payment;
}

export async function listByUser(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listAll(page = 1, limit = 20, status?: string) {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar')
      .lean(),
    Payment.countDocuments(filter),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getRecentDonations(limit = 10) {
  return Payment.find({ status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(limit)
    .populate('userId', 'name avatar donorBadge')
    .lean();
}

export async function getTopDonors(limit = 10) {
  return User.find({ totalDonated: { $gt: 0 } })
    .sort({ totalDonated: -1 })
    .limit(limit)
    .select('name avatar totalDonated donorBadge')
    .lean();
}

export async function getStats() {
  const [totalAmount, totalPayments, todayAmount] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.countDocuments({ status: 'completed' }),
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    totalAmount: totalAmount[0]?.total || 0,
    totalPayments,
    todayAmount: todayAmount[0]?.total || 0,
  };
}
