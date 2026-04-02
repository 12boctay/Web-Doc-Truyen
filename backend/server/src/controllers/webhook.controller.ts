import { Request, Response } from 'express';
import * as webhookService from '../services/webhook.service';

export async function newComic(req: Request, res: Response): Promise<void> {
  try {
    const result = await webhookService.handleNewComic(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function newChapter(req: Request, res: Response): Promise<void> {
  try {
    const result = await webhookService.handleNewChapter(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function crawlStatus(req: Request, res: Response): Promise<void> {
  try {
    const result = await webhookService.handleCrawlStatus(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
