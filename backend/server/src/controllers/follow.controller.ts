import { Request, Response } from 'express';
import * as followService from '../services/follow.service';
import { param } from '../utils/helpers';

export async function listFollows(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await followService.listFollows(req.user!.userId, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function follow(req: Request, res: Response): Promise<void> {
  try {
    const data = await followService.follow(req.user!.userId, param(req.params.comicId));
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function unfollow(req: Request, res: Response): Promise<void> {
  try {
    await followService.unfollow(req.user!.userId, param(req.params.comicId));
    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
