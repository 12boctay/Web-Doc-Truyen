import { Request, Response } from 'express';
import * as crawlSourceService from '../services/crawl-source.service';
import { param } from '../utils/helpers';

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const sources = await crawlSourceService.list();
    res.json({ success: true, data: sources });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const source = await crawlSourceService.getById(param(req.params.id));
    res.json({ success: true, data: source });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const source = await crawlSourceService.create(req.body);
    res.status(201).json({ success: true, data: source });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const source = await crawlSourceService.update(param(req.params.id), req.body);
    res.json({ success: true, data: source });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await crawlSourceService.remove(param(req.params.id));
    res.json({ success: true, message: 'CrawlSource deleted' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function test(req: Request, res: Response): Promise<void> {
  try {
    const result = await crawlSourceService.testSource(param(req.params.id));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
