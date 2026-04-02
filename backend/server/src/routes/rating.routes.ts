import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as ratingController from '../controllers/rating.controller';

const router = Router();

router.post('/', authMiddleware, ratingController.rateComic);
router.get('/comic/:comicId', ratingController.getComicRating);
router.get('/me/:comicId', authMiddleware, ratingController.getMyRating);

export { router as ratingRoutes };
