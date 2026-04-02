import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as historyController from '../controllers/history.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', historyController.getHistory);
router.post('/', historyController.saveProgress);
router.delete('/:comicId', historyController.deleteHistory);
router.delete('/', historyController.clearHistory);

export { router as historyRoutes };
