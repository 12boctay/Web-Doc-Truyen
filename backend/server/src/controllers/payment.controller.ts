import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import * as goalService from '../services/donation-goal.service';
import * as notificationService from '../services/notification.service';
import { emitNotificationToUser } from '../socket/notification.handler';
import { param } from '../utils/helpers';

// POST /api/payments — user creates a donation
export async function createPayment(req: Request, res: Response) {
  try {
    const { amount, method, message, displayName, isAnonymous, donationGoalId } = req.body;
    if (!amount || !method) {
      res.status(400).json({ success: false, error: 'amount and method are required' });
      return;
    }
    if (amount < 10000) {
      res.status(400).json({ success: false, error: 'Minimum donation is 10,000 VND' });
      return;
    }

    const payment = await paymentService.createPayment({
      userId: req.user!.userId,
      amount,
      method,
      message,
      displayName,
      isAnonymous,
      donationGoalId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // For bank_transfer, return payment info directly (user pays manually)
    // For other methods, would return a paymentUrl from gateway
    // For now, return the payment object
    res.status(201).json({ success: true, data: payment });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

// GET /api/payments/my — user's payment history
export async function myPayments(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await paymentService.listByUser(req.user!.userId, page, limit);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/payments — admin list all payments
export async function listPayments(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await paymentService.listAll(page, limit, status);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/payments/:id/complete — admin manually completes payment (bank transfer)
export async function completePayment(req: Request, res: Response) {
  try {
    const paymentId = param(req.params.id);
    const { transactionId, donationGoalId } = req.body;

    const payment = await paymentService.completePayment(paymentId, transactionId);

    // Update donation goal if specified
    if (donationGoalId) {
      await goalService.addAmount(donationGoalId, payment.amount);
    }

    // Send thank you notification
    const notif = await notificationService.create({
      userId: payment.userId.toString(),
      type: 'donation_thanks',
      title: 'Cảm ơn bạn đã ủng hộ!',
      message: `Khoản donate ${payment.amount.toLocaleString('vi-VN')}đ đã được xác nhận.`,
      data: { paymentId: payment._id.toString() },
    });
    emitNotificationToUser(payment.userId.toString(), notif);

    res.json({ success: true, data: payment });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

// PUT /api/payments/:id/fail — admin marks payment as failed
export async function failPayment(req: Request, res: Response) {
  try {
    const payment = await paymentService.failPayment(param(req.params.id));
    res.json({ success: true, data: payment });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
}

// GET /api/payments/recent — public recent donations
export async function recentDonations(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await paymentService.getRecentDonations(limit);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/payments/top-donors — public top donors
export async function topDonors(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await paymentService.getTopDonors(limit);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/payments/stats — admin stats
export async function stats(_req: Request, res: Response) {
  try {
    const data = await paymentService.getStats();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
