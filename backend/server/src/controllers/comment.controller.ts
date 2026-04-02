import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { param } from '../utils/helpers';

export async function createComment(req: Request, res: Response): Promise<void> {
  try {
    const data = await commentService.createComment(req.user!.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function listComments(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await commentService.listComments(param(req.params.comicId), page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function listChapterComments(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await commentService.listChapterComments(param(req.params.chapterId), page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  try {
    const data = await commentService.updateComment(req.user!.userId, param(req.params.id), req.body.content);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function likeComment(req: Request, res: Response): Promise<void> {
  try {
    const data = await commentService.likeComment(req.user!.userId, param(req.params.id));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function unlikeComment(req: Request, res: Response): Promise<void> {
  try {
    const data = await commentService.unlikeComment(req.user!.userId, param(req.params.id));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function moderateComment(req: Request, res: Response): Promise<void> {
  try {
    const data = await commentService.moderateComment(param(req.params.id), req.body.status);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    const data = await commentService.deleteComment(
      req.user!.userId,
      param(req.params.id),
      req.user!.role,
    );
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
