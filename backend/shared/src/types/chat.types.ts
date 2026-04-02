export type ChatRoomType = 'global' | 'group' | 'direct';
export type ChatMessageStatus = 'visible' | 'deleted';

export interface IChatRoom {
  _id: string;
  name: string;
  type: ChatRoomType;
  members: string[];
  createdBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessage {
  _id: string;
  roomId: string;
  userId: string;
  content: string;
  replyTo?: string;
  status: ChatMessageStatus;
  createdAt: Date;
}

// Socket event names
export const SOCKET_EVENTS = {
  // Chat events
  CHAT_SEND: 'chat:send',
  CHAT_NEW: 'chat:new',
  CHAT_DELETE: 'chat:delete',
  CHAT_DELETED: 'chat:deleted',
  CHAT_TYPING: 'chat:typing',
  CHAT_TYPING_INDICATOR: 'chat:typing:indicator',
  CHAT_HISTORY: 'chat:history',
  CHAT_HISTORY_RESULT: 'chat:history:result',

  // Room events
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',

  // Presence events
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  PRESENCE_LIST: 'presence:list',
  PRESENCE_LIST_RESULT: 'presence:list:result',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_UNREAD: 'notification:unread',

  // Error
  ERROR: 'error',
} as const;

// Socket payload interfaces
export interface ChatSendPayload {
  roomId: string;
  content: string;
  replyTo?: string;
}

export interface ChatDeletePayload {
  messageId: string;
  roomId: string;
}

export interface ChatTypingPayload {
  roomId: string;
}

export interface ChatHistoryPayload {
  roomId: string;
  before?: string; // cursor (message _id)
  limit?: number;
}

export interface ChatNewPayload {
  message: IChatMessage & { user?: { _id: string; name: string; avatar?: string } };
  replyToMessage?: { _id: string; content: string; userId: string; user?: { name: string } };
}

export interface ChatDeletedPayload {
  messageId: string;
  roomId: string;
}

export interface ChatTypingIndicatorPayload {
  roomId: string;
  userId: string;
  userName: string;
}

export interface PresencePayload {
  userId: string;
}
