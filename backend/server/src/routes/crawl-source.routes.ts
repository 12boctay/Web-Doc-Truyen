import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as crawlSourceController from '../controllers/crawl-source.controller';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/', crawlSourceController.list);
router.get('/:id', crawlSourceController.getById);
router.post('/', crawlSourceController.create);
router.put('/:id', crawlSourceController.update);
router.delete('/:id', crawlSourceController.remove);
router.post('/:id/test', crawlSourceController.test);

export { router as crawlSourceRoutes };
