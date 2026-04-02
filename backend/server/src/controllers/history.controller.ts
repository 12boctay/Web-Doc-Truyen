import { Request, Response } from 'express';
import * as historyService from '../services/history.service';
import { param } from '../utils/helpers';

export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await historyService.getHistory(req.user!.userId, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function saveProgress(req: Request, res: Response): Promise<void> {
  try {
    const data = await historyService.saveProgress(req.user!.userId, req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function deleteHistory(req: Request, res: Response): Promise<void> {
  try {
    await historyService.deleteHistory(req.user!.userId, param(req.params.comicId));
    res.json({ success: true, message: 'History entry deleted' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function clearHistory(req: Request, res: Response): Promise<void> {
  try {
    const data = await historyService.clearHistory(req.user!.userId);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
