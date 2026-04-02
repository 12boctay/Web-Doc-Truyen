import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';
import { param } from '../utils/helpers';

export async function listRooms(req: Request, res: Response) {
  try {
    const rooms = await chatService.listUserRooms(req.user!.userId);
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function listAllRooms(_req: Request, res: Response) {
  try {
    const rooms = await chatService.listAllRooms();
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    const { name, memberIds } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Room name is required' });
      return;
    }
    const room = await chatService.createRoom(name, 'group', req.user!.userId, memberIds);
    res.status(201).json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function joinRoom(req: Request, res: Response) {
  try {
    const room = await chatService.joinRoom(param(req.params.id), req.user!.userId);
    if (!room) {
      res.status(404).json({ success: false, error: 'Room not found' });
      return;
    }
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function leaveRoom(req: Request, res: Response) {
  try {
    const room = await chatService.leaveRoom(param(req.params.id), req.user!.userId);
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function deleteRoom(req: Request, res: Response) {
  try {
    const room = await chatService.deleteRoom(param(req.params.id));
    if (!room) {
      res.status(404).json({ success: false, error: 'Room not found' });
      return;
    }
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getOrCreateDirectRoom(req: Request, res: Response) {
  try {
    const userId = param(req.params.userId);
    if (userId === req.user!.userId) {
      res.status(400).json({ success: false, error: 'Cannot create DM with yourself' });
      return;
    }
    const room = await chatService.getOrCreateDirectRoom(req.user!.userId, userId);
    res.json({ success: true, data: room });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
