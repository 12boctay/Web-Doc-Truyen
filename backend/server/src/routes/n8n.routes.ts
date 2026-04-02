import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as n8nController from '../controllers/n8n.controller';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

router.post('/trigger-crawl', n8nController.triggerCrawl);
router.get('/workflows', n8nController.listWorkflows);
router.get('/executions', n8nController.listExecutions);
router.get('/crawler-status', n8nController.getCrawlerStatus);

export { router as n8nRoutes };
