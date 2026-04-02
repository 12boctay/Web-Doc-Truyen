import { Notification } from '../models/Notification';
import type { NotificationType, INotificationData } from '@webdoctruyen/shared-be';
import mongoose from 'mongoose';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Partial<INotificationData>;
}

export async function create(input: CreateNotificationInput) {
  return Notification.create({
    userId: new mongoose.Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data || {},
  });
}

export async function createForMany(userIds: string[], type: NotificationType, title: string, message: string, data?: Partial<INotificationData>) {
  const docs = userIds.map((userId) => ({
    userId: new mongoose.Types.ObjectId(userId),
    type,
    title,
    message,
    data: data || {},
    read: false,
    createdAt: new Date(),
  }));

  if (docs.length === 0) return [];
  return Notification.insertMany(docs);
}

export async function list(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUnreadCount(userId: string) {
  return Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    read: false,
  });
}

export async function getUnreadForUser(userId: string) {
  return Notification.find({
    userId: new mongoose.Types.ObjectId(userId),
    read: false,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export async function markRead(notificationId: string, userId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
    { read: true },
    { new: true },
  );
}

export async function markAllRead(userId: string) {
  return Notification.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), read: false },
    { read: true },
  );
}
