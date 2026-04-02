import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { param } from '../utils/helpers';

export async function listCategories(_req: Request, res: Response): Promise<void> {
  try {
    const data = await categoryService.listCategories();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const category = await categoryService.updateCategory(param(req.params.id), req.body);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    await categoryService.deleteCategory(param(req.params.id));
    res.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
}
