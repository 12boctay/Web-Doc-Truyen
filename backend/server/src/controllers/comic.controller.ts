import { Request, Response } from 'express';
import * as comicService from '../services/comic.service';
import { param } from '../utils/helpers';

export async function listComics(req: Request, res: Response): Promise<void> {
  try {
    const result = await comicService.listComics(req.query as Record<string, string>);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getComic(req: Request, res: Response): Promise<void> {
  try {
    const comic = await comicService.getComicBySlug(param(req.params.slug));
    res.json({ success: true, data: comic });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getComicChapters(req: Request, res: Response): Promise<void> {
  try {
    const chapters = await comicService.getComicChapters(param(req.params.slug));
    res.json({ success: true, data: chapters });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getHotComics(_req: Request, res: Response): Promise<void> {
  try {
    const data = await comicService.getHotComics();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getRecommendedComics(_req: Request, res: Response): Promise<void> {
  try {
    const data = await comicService.getRecommendedComics();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function createComic(req: Request, res: Response): Promise<void> {
  try {
    const comic = await comicService.createComic(req.body);
    res.status(201).json({ success: true, data: comic });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function updateComic(req: Request, res: Response): Promise<void> {
  try {
    const comic = await comicService.updateComic(param(req.params.id), req.body);
    res.json({ success: true, data: comic });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function deleteComic(req: Request, res: Response): Promise<void> {
  try {
    await comicService.deleteComic(param(req.params.id));
    res.json({ success: true, message: 'Comic deleted' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
