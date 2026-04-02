import { Request, Response } from 'express';
import * as ratingService from '../services/rating.service';
import { param } from '../utils/helpers';

export async function rateComic(req: Request, res: Response): Promise<void> {
  try {
    const data = await ratingService.rateComic(
      req.user!.userId,
      req.body.comicId,
      req.body.score,
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getComicRating(req: Request, res: Response): Promise<void> {
  try {
    const data = await ratingService.getComicRating(param(req.params.comicId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getMyRating(req: Request, res: Response): Promise<void> {
  try {
    const data = await ratingService.getMyRating(req.user!.userId, param(req.params.comicId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
