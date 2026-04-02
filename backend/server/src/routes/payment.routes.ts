import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

// Public
router.get('/recent', paymentController.recentDonations);
router.get('/top-donors', paymentController.topDonors);

// Authenticated user
router.post('/', authMiddleware, paymentController.createPayment);
router.get('/my', authMiddleware, paymentController.myPayments);

// Admin
router.get('/', authMiddleware, requireRole('admin'), paymentController.listPayments);
router.get('/stats', authMiddleware, requireRole('admin'), paymentController.stats);
router.put(
  '/:id/complete',
  authMiddleware,
  requireRole('admin'),
  paymentController.completePayment,
);
router.put('/:id/fail', authMiddleware, requireRole('admin'), paymentController.failPayment);

export { router as paymentRoutes };
