import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as categoryController from '../controllers/category.controller';

const router = Router();

router.get('/', categoryController.listCategories);
router.post('/', authMiddleware, requireRole('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware, requireRole('admin'), categoryController.updateCategory);
router.delete('/:id', authMiddleware, requireRole('admin'), categoryController.deleteCategory);

export { router as categoryRoutes };
