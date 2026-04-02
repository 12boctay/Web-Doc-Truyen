import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

router.post('/images', authMiddleware, requireRole('admin'), upload.array('images', 10), uploadController.uploadImages);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadController.uploadAvatar);

export { router as uploadRoutes };
