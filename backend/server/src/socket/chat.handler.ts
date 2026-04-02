import { Namespace } from 'socket.io';
import { AuthenticatedSocket } from './auth';
import { SOCKET_EVENTS } from '@webdoctruyen/shared-be';
import { redis } from '../config/redis';
import * as chatService from '../services/chat.service';
import * as messageService from '../services/message.service';
import type { ChatSendPayload, ChatDeletePayload, ChatTypingPayload, ChatHistoryPayload } from '@webdoctruyen/shared-be';

const ONLINE_SET = 'online:users';

export function registerChatHandlers(namespace: Namespace, socket: AuthenticatedSocket) {
  const userId = socket.userId;
  const userRole = socket.userRole;

  // Add to online set and broadcast
  redis.sadd(ONLINE_SET, userId);
  namespace.emit(SOCKET_EVENTS.PRESENCE_ONLINE, { userId });

  // Auto-join global room
  chatService.getGlobalRoom().then((room) => {
    if (room) {
      socket.join(room._id.toString());
      chatService.joinRoom(room._id.toString(), userId).catch(() => {});
    }
  });

  // Chat: send message
  socket.on(SOCKET_EVENTS.CHAT_SEND, async (payload: ChatSendPayload) => {
    try {
      const { roomId, content, replyTo } = payload;
      if (!roomId || !content?.trim()) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'roomId and content are required' });
        return;
      }

      const result = await messageService.sendMessage({ roomId, userId, content: content.trim(), replyTo });
      namespace.to(roomId).emit(SOCKET_EVENTS.CHAT_NEW, result);
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: err.message });
    }
  });

  // Chat: delete message
  socket.on(SOCKET_EVENTS.CHAT_DELETE, async (payload: ChatDeletePayload) => {
    try {
      const { messageId, roomId } = payload;
      await messageService.deleteMessage(messageId, userId, userRole);
      namespace.to(roomId).emit(SOCKET_EVENTS.CHAT_DELETED, { messageId, roomId });
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: err.message });
    }
  });

  // Chat: typing indicator
  socket.on(SOCKET_EVENTS.CHAT_TYPING, async (payload: ChatTypingPayload) => {
    const { roomId } = payload;
    socket.to(roomId).emit(SOCKET_EVENTS.CHAT_TYPING_INDICATOR, {
      roomId,
      userId,
      userName: '', // Will be populated by frontend from user data
    });
  });

  // Chat: history
  socket.on(SOCKET_EVENTS.CHAT_HISTORY, async (payload: ChatHistoryPayload) => {
    try {
      const { roomId, before, limit } = payload;
      const messages = await messageService.getHistory(roomId, before, limit);
      socket.emit(SOCKET_EVENTS.CHAT_HISTORY_RESULT, { roomId, messages });
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: err.message });
    }
  });

  // Room: join
  socket.on(SOCKET_EVENTS.ROOM_JOIN, async (payload: { roomId: string }) => {
    try {
      await chatService.joinRoom(payload.roomId, userId);
      socket.join(payload.roomId);
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, { roomId: payload.roomId });
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: err.message });
    }
  });

  // Room: leave
  socket.on(SOCKET_EVENTS.ROOM_LEAVE, async (payload: { roomId: string }) => {
    try {
      await chatService.leaveRoom(payload.roomId, userId);
      socket.leave(payload.roomId);
      socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId: payload.roomId });
    } catch (err: any) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: err.message });
    }
  });

  // Presence: list
  socket.on(SOCKET_EVENTS.PRESENCE_LIST, async () => {
    const onlineUsers = await redis.smembers(ONLINE_SET);
    socket.emit(SOCKET_EVENTS.PRESENCE_LIST_RESULT, { users: onlineUsers });
  });

  // Disconnect
  socket.on('disconnect', () => {
    redis.srem(ONLINE_SET, userId);
    namespace.emit(SOCKET_EVENTS.PRESENCE_OFFLINE, { userId });
  });
}
