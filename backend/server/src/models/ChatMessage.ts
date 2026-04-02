import mongoose, { Schema, Document } from 'mongoose';
import type { IChatMessage } from '@webdoctruyen/shared-be';

export interface ChatMessageDocument
  extends Omit<IChatMessage, '_id' | 'roomId' | 'userId' | 'replyTo'>, Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  replyTo?: mongoose.Types.ObjectId;
}

const chatMessageSchema = new Schema<ChatMessageDocument>({
  roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  replyTo: { type: Schema.Types.ObjectId, ref: 'ChatMessage' },
  status: { type: String, enum: ['visible', 'deleted'], default: 'visible' },
  createdAt: { type: Date, default: Date.now },
});

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model<ChatMessageDocument>('ChatMessage', chatMessageSchema);
