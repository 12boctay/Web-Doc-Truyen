import { Request, Response } from 'express';
import * as n8nService from '../services/n8n.service';

export async function triggerCrawl(req: Request, res: Response): Promise<void> {
  try {
    const { siteName, comicUrls } = req.body;
    if (!siteName) {
      res.status(400).json({ success: false, error: 'siteName is required' });
      return;
    }
    const result = await n8nService.triggerCrawl(siteName, comicUrls);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function listWorkflows(_req: Request, res: Response): Promise<void> {
  try {
    const result = await n8nService.listWorkflows();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function listExecutions(req: Request, res: Response): Promise<void> {
  try {
    const workflowId = req.query.workflowId as string | undefined;
    const result = await n8nService.listExecutions(workflowId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function getCrawlerStatus(_req: Request, res: Response): Promise<void> {
  try {
    const result = await n8nService.getCrawlerStatus();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
