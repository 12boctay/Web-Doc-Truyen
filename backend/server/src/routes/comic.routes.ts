import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as comicController from '../controllers/comic.controller';

const router = Router();

router.get('/', comicController.listComics);
router.get('/hot', comicController.getHotComics);
router.get('/recommended', comicController.getRecommendedComics);
router.get('/:slug', comicController.getComic);
router.get('/:slug/chapters', comicController.getComicChapters);

router.post('/', authMiddleware, requireRole('admin'), comicController.createComic);
router.put('/:id', authMiddleware, requireRole('admin'), comicController.updateComic);
router.delete('/:id', authMiddleware, requireRole('admin'), comicController.deleteComic);

export { router as comicRoutes };
