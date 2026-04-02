import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as followController from '../controllers/follow.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', followController.listFollows);
router.post('/:comicId', followController.follow);
router.delete('/:comicId', followController.unfollow);

export { router as followRoutes };
