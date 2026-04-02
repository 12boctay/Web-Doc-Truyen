import { Request, Response } from 'express';
import * as searchService from '../services/search.service';

export async function search(req: Request, res: Response): Promise<void> {
  try {
    const { q, page, limit } = req.query;
    const result = await searchService.searchComics(
      q as string,
      Number(page) || 1,
      Number(limit) || 20,
    );
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function suggest(req: Request, res: Response): Promise<void> {
  try {
    const data = await searchService.suggestComics(req.query.q as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
