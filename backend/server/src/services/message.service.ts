import { ChatMessage } from '../models/ChatMessage';
import { ChatRoom } from '../models/ChatRoom';
import mongoose from 'mongoose';
import { hasRole } from '@webdoctruyen/shared-be';

interface SendMessageParams {
  roomId: string;
  userId: string;
  content: string;
  replyTo?: string;
}

export async function sendMessage({ roomId, userId, content, replyTo }: SendMessageParams) {
  const room = await ChatRoom.findById(roomId);
  if (!room || !room.isActive) throw new Error('Room not found');

  // Check membership (global room allows all)
  if (room.type !== 'global') {
    const isMember = room.members.some((m) => m.toString() === userId);
    if (!isMember) throw new Error('Not a member of this room');
  }

  const message = await ChatMessage.create({
    roomId: new mongoose.Types.ObjectId(roomId),
    userId: new mongoose.Types.ObjectId(userId),
    content,
    replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
    status: 'visible',
  });

  // Populate user info
  const populated = await ChatMessage.findById(message._id)
    .populate('userId', 'name avatar')
    .lean();

  // Build response
  const result: any = {
    message: {
      ...populated,
      user: populated?.userId,
    },
  };

  // If replying, include the original message
  if (replyTo) {
    const replyMessage = await ChatMessage.findById(replyTo)
      .populate('userId', 'name')
      .lean();
    if (replyMessage) {
      result.replyToMessage = {
        _id: replyMessage._id,
        content: replyMessage.content,
        userId: replyMessage.userId,
        user: (replyMessage as any).userId,
      };
    }
  }

  return result;
}

export async function deleteMessage(messageId: string, userId: string, userRole: string) {
  const message = await ChatMessage.findById(messageId);
  if (!message) throw new Error('Message not found');

  const isOwner = message.userId.toString() === userId;
  const isMod = hasRole(userRole as any, 'moderator');

  if (!isOwner && !isMod) {
    throw new Error('Permission denied: cannot delete this message');
  }

  message.status = 'deleted';
  await message.save();
  return message;
}

export async function getHistory(roomId: string, before?: string, limit: number = 50) {
  const query: any = {
    roomId: new mongoose.Types.ObjectId(roomId),
    status: 'visible',
  };

  if (before) {
    query._id = { $lt: new mongoose.Types.ObjectId(before) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 50))
    .populate('userId', 'name avatar')
    .populate('replyTo', 'content userId')
    .lean();

  return messages.reverse();
}
