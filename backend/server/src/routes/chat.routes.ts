import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Static routes first (before :id params)
router.get('/rooms', chatController.listRooms);
router.get('/rooms/all', requireRole('admin'), chatController.listAllRooms);
router.post('/rooms', requireRole('moderator'), chatController.createRoom);
router.post('/rooms/direct/:userId', chatController.getOrCreateDirectRoom);

// Parameterized routes
router.post('/rooms/:id/join', chatController.joinRoom);
router.post('/rooms/:id/leave', chatController.leaveRoom);
router.delete('/rooms/:id', requireRole('admin'), chatController.deleteRoom);

export { router as chatRoutes };
