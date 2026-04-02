import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as goalController from '../controllers/donation-goal.controller';

const router = Router();

// Public
router.get('/active', goalController.getActive);
router.get('/:id', goalController.getById);

// Admin
router.get('/', authMiddleware, requireRole('admin'), goalController.list);
router.post('/', authMiddleware, requireRole('admin'), goalController.create);
router.put('/:id', authMiddleware, requireRole('admin'), goalController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), goalController.remove);

export { router as donationGoalRoutes };
