import { Request, Response } from 'express';
import * as rankingService from '../services/ranking.service';

function makeHandler(
  type: 'daily' | 'weekly' | 'monthly' | 'all-time' | 'top-follow' | 'top-rating',
) {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await rankingService.getRanking(type);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message });
    }
  };
}

export const getDaily = makeHandler('daily');
export const getWeekly = makeHandler('weekly');
export const getMonthly = makeHandler('monthly');
export const getAllTime = makeHandler('all-time');
export const getTopFollow = makeHandler('top-follow');
export const getTopRating = makeHandler('top-rating');
