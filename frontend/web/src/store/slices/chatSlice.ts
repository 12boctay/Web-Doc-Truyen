'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IChatRoom, IChatMessage } from '@webdoctruyen/shared-fe';

interface ChatMessageWithUser extends IChatMessage {
  user?: { _id: string; name: string; avatar?: string };
}

interface ChatState {
  rooms: IChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessageWithUser[]>;
  onlineUsers: string[];
  typingUsers: Record<string, { userId: string; userName: string }[]>;
}

const initialState: ChatState = {
  rooms: [],
  activeRoomId: null,
  messages: {},
  onlineUsers: [],
  typingUsers: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<IChatRoom[]>) {
      state.rooms = action.payload;
    },
    setActiveRoom(state, action: PayloadAction<string | null>) {
      state.activeRoomId = action.payload;
    },
    addMessage(state, action: PayloadAction<{ roomId: string; message: ChatMessageWithUser }>) {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      // Avoid duplicates
      if (!state.messages[roomId].some((m) => m._id === message._id)) {
        state.messages[roomId].push(message);
      }
    },
    setMessages(state, action: PayloadAction<{ roomId: string; messages: ChatMessageWithUser[] }>) {
      state.messages[action.payload.roomId] = action.payload.messages;
    },
    prependMessages(
      state,
      action: PayloadAction<{ roomId: string; messages: ChatMessageWithUser[] }>,
    ) {
      const { roomId, messages } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId] = [...messages, ...state.messages[roomId]];
    },
    removeMessage(state, action: PayloadAction<{ roomId: string; messageId: string }>) {
      const { roomId, messageId } = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter((m) => m._id !== messageId);
      }
    },
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },
    addOnlineUser(state, action: PayloadAction<string>) {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser(state, action: PayloadAction<string>) {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },
    setTypingUser(
      state,
      action: PayloadAction<{ roomId: string; userId: string; userName: string }>,
    ) {
      const { roomId, userId, userName } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      if (!state.typingUsers[roomId].some((t) => t.userId === userId)) {
        state.typingUsers[roomId].push({ userId, userName });
      }
    },
    removeTypingUser(state, action: PayloadAction<{ roomId: string; userId: string }>) {
      const { roomId, userId } = action.payload;
      if (state.typingUsers[roomId]) {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter((t) => t.userId !== userId);
      }
    },
    resetChat() {
      return initialState;
    },
  },
});

export const {
  setRooms,
  setActiveRoom,
  addMessage,
  setMessages,
  prependMessages,
  removeMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  removeTypingUser,
  resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
