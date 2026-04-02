import { Router } from 'express';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@webdoctruyen/shared-be';
import { validate } from '../middlewares/validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authLimiter, refreshLimiter } from '../middlewares/rateLimiter';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  getMeHandler,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerHandler);
router.post('/login', authLimiter, validate(loginSchema), loginHandler);
router.post('/refresh', refreshLimiter, refreshHandler);
router.post('/logout', authMiddleware, logoutHandler);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordHandler);
router.get('/me', authMiddleware, getMeHandler);

export { router as authRoutes };
