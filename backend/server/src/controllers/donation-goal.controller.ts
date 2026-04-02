import { Request, Response } from 'express';
import * as goalService from '../services/donation-goal.service';
import { param } from '../utils/helpers';

export async function list(_req: Request, res: Response) {
  try {
    const goals = await goalService.list();
    res.json({ success: true, data: goals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getActive(_req: Request, res: Response) {
  try {
    const goals = await goalService.getActive();
    res.json({ success: true, data: goals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const goal = await goalService.getById(param(req.params.id));
    if (!goal) {
      res.status(404).json({ success: false, error: 'Donation goal not found' });
      return;
    }
    res.json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { title, description, targetAmount, startDate, endDate } = req.body;
    if (!title || !targetAmount || !startDate || !endDate) {
      res.status(400).json({ success: false, error: 'title, targetAmount, startDate, endDate are required' });
      return;
    }
    const goal = await goalService.create({ title, description, targetAmount, startDate, endDate });
    res.status(201).json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const goal = await goalService.update(param(req.params.id), req.body);
    if (!goal) {
      res.status(404).json({ success: false, error: 'Donation goal not found' });
      return;
    }
    res.json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const goal = await goalService.remove(param(req.params.id));
    if (!goal) {
      res.status(404).json({ success: false, error: 'Donation goal not found' });
      return;
    }
    res.json({ success: true, message: 'Donation goal deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
