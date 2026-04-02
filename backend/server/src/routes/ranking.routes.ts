import { Router } from 'express';
import * as rankingController from '../controllers/ranking.controller';

const router = Router();

router.get('/daily', rankingController.getDaily);
router.get('/weekly', rankingController.getWeekly);
router.get('/monthly', rankingController.getMonthly);
router.get('/all-time', rankingController.getAllTime);
router.get('/top-follow', rankingController.getTopFollow);
router.get('/top-rating', rankingController.getTopRating);

export { router as rankingRoutes };
