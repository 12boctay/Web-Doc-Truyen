export type PaymentMethod = 'momo' | 'vnpay' | 'zalopay' | 'stripe' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type Currency = 'VND' | 'USD';

export interface IPaymentMetadata {
  gatewayResponse?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IPayment {
  _id: string;
  userId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  message: string;
  displayName: string;
  isAnonymous: boolean;
  metadata: IPaymentMetadata;
  completedAt: Date | null;
  createdAt: Date;
}

export interface IDonationGoal {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}
