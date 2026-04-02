import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);
router.post('/announce', requireRole('admin'), notificationController.sendAnnouncement);

export { router as notificationRoutes };
