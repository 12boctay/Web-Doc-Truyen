import mongoose, { Schema, Document } from 'mongoose';
import type { INotification } from '@webdoctruyen/shared-be';

export interface NotificationDocument extends Omit<INotification, '_id' | 'userId'>, Document {
  userId: mongoose.Types.ObjectId;
}

const notificationSchema = new Schema<NotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_chapter', 'reply_comment', 'announcement', 'chat_message', 'donation_thanks'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  data: {
    comicId: { type: Schema.Types.ObjectId },
    chapterId: { type: Schema.Types.ObjectId },
    commentId: { type: Schema.Types.ObjectId },
    chatRoomId: { type: Schema.Types.ObjectId },
    paymentId: { type: Schema.Types.ObjectId },
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
// TTL index: auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);
