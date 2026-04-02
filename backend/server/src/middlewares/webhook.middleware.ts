import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function webhookAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret'];

  if (!secret || secret !== (env as any).WEBHOOK_SECRET) {
    res.status(401).json({ success: false, error: 'Invalid webhook secret' });
    return;
  }

  next();
}
