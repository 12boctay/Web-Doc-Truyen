import { Namespace } from 'socket.io';
import { AuthenticatedSocket } from './auth';
import { SOCKET_EVENTS } from '@webdoctruyen/shared-be';
import * as notificationService from '../services/notification.service';
import { redis } from '../config/redis';

let notificationNs: Namespace | null = null;

export function registerNotificationHandlers(namespace: Namespace, socket: AuthenticatedSocket) {
  notificationNs = namespace;
  const userId = socket.userId;

  // Join a room specific to this user for targeted notifications
  socket.join(`user:${userId}`);

  // On connect: send all unread notifications
  notificationService.getUnreadForUser(userId).then((notifications) => {
    socket.emit(SOCKET_EVENTS.NOTIFICATION_UNREAD, { notifications });
  }).catch((err) => {
    console.error('Failed to fetch unread notifications:', err);
  });

  socket.on('disconnect', () => {
    // Cleanup if needed
  });
}

// Helper to emit notification in real-time (called from services)
export async function emitNotificationToUser(userId: string, notification: any) {
  if (!notificationNs) return;

  // Check if user is online
  const isOnline = await redis.sismember('online:users', userId);
  if (isOnline) {
    notificationNs.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, { notification });
  }
}
