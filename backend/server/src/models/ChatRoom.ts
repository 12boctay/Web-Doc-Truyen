import mongoose, { Schema, Document } from 'mongoose';
import type { IChatRoom } from '@webdoctruyen/shared-be';

export interface ChatRoomDocument
  extends Omit<IChatRoom, '_id' | 'members' | 'createdBy'>, Document {
  members: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
}

const chatRoomSchema = new Schema<ChatRoomDocument>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['global', 'group', 'direct'], required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

chatRoomSchema.index({ members: 1 });
chatRoomSchema.index({ type: 1 });

export const ChatRoom = mongoose.model<ChatRoomDocument>('ChatRoom', chatRoomSchema);
