import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as commentController from '../controllers/comment.controller';

const router = Router();

// Public routes
router.get('/comic/:comicId', commentController.listComments);
router.get('/chapter/:chapterId', commentController.listChapterComments);

// Authenticated routes
router.post('/', authMiddleware, commentController.createComment);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

// Like/unlike
router.post('/:id/like', authMiddleware, commentController.likeComment);
router.delete('/:id/like', authMiddleware, commentController.unlikeComment);

// Moderator actions
router.put(
  '/:id/status',
  authMiddleware,
  requireRole('moderator'),
  commentController.moderateComment,
);

export { router as commentRoutes };
