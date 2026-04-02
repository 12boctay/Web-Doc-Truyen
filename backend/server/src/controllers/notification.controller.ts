import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { User } from '../models/User';
import { emitNotificationToUser } from '../socket/notification.handler';
import { param } from '../utils/helpers';

export async function listNotifications(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.list(req.user!.userId, page, limit);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function markRead(req: Request, res: Response) {
  try {
    const notif = await notificationService.markRead(param(req.params.id), req.user!.userId);
    if (!notif) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    res.json({ success: true, data: notif });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function sendAnnouncement(req: Request, res: Response) {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      res.status(400).json({ success: false, error: 'Title and message are required' });
      return;
    }

    const users = await User.find({ status: 'active' }, '_id').lean();
    const userIds = users.map((u) => u._id.toString());

    const notifications = await notificationService.createForMany(
      userIds,
      'announcement',
      title,
      message,
    );

    for (const notif of notifications) {
      emitNotificationToUser(notif.userId.toString(), notif);
    }

    res.json({ success: true, message: `Announcement sent to ${userIds.length} users` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
