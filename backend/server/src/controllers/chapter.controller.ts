import { Request, Response } from 'express';
import * as chapterService from '../services/chapter.service';
import { param } from '../utils/helpers';

export async function getChapter(req: Request, res: Response): Promise<void> {
  try {
    const chapter = await chapterService.getChapterBySlugs(
      param(req.params.comicSlug),
      param(req.params.chapSlug),
    );
    res.json({ success: true, data: chapter });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function createChapter(req: Request, res: Response): Promise<void> {
  try {
    const chapter = await chapterService.createChapter(req.body);
    res.status(201).json({ success: true, data: chapter });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function updateChapter(req: Request, res: Response): Promise<void> {
  try {
    const chapter = await chapterService.updateChapter(param(req.params.id), req.body);
    res.json({ success: true, data: chapter });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function deleteChapter(req: Request, res: Response): Promise<void> {
  try {
    await chapterService.deleteChapter(param(req.params.id));
    res.json({ success: true, message: 'Chapter deleted' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
