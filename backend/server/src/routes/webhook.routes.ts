import { Router } from 'express';
import { webhookAuth } from '../middlewares/webhook.middleware';
import * as webhookController from '../controllers/webhook.controller';

const router = Router();

router.use(webhookAuth);

router.post('/crawler/new-comic', webhookController.newComic);
router.post('/crawler/new-chapter', webhookController.newChapter);
router.post('/crawler/status', webhookController.crawlStatus);

export { router as webhookRoutes };
