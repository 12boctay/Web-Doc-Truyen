import { Request, Response } from 'express';
import * as uploadService from '../services/upload.service';

export async function uploadImages(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files uploaded' });
      return;
    }
    const results = await uploadService.uploadImages(files, 'chapters');
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function uploadAvatar(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }
    const results = await uploadService.uploadImages([file], 'avatars');
    res.json({ success: true, data: results[0] });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
