import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as chapterController from '../controllers/chapter.controller';

const router = Router();

router.get('/:comicSlug/:chapSlug', chapterController.getChapter);
router.post('/', authMiddleware, requireRole('admin'), chapterController.createChapter);
router.put('/:id', authMiddleware, requireRole('admin'), chapterController.updateChapter);
router.delete('/:id', authMiddleware, requireRole('admin'), chapterController.deleteChapter);

export { router as chapterRoutes };
