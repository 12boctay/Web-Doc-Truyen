'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import {
  connectSockets,
  disconnectSockets,
  getChatSocket,
  getNotificationSocket,
} from '@/lib/socket';
import { SOCKET_EVENTS } from '@webdoctruyen/shared-fe';
import {
  addMessage,
  removeMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  removeTypingUser,
  setMessages,
  resetChat,
} from '@/store/slices/chatSlice';
import {
  addNotification,
  setNotifications,
  setUnreadCount,
  resetNotifications,
} from '@/store/slices/notificationSlice';

export function useSocket() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (connectedRef.current) {
        disconnectSockets();
        dispatch(resetChat());
        dispatch(resetNotifications());
        connectedRef.current = false;
      }
      return;
    }

    if (connectedRef.current) return;

    connectSockets(accessToken);
    connectedRef.current = true;

    const chatSocket = getChatSocket();
    const notifSocket = getNotificationSocket();

    if (chatSocket) {
      // Chat messages
      chatSocket.on(SOCKET_EVENTS.CHAT_NEW, (data: any) => {
        const msg = data.message;
        if (msg?.roomId) {
          dispatch(addMessage({ roomId: msg.roomId.toString(), message: msg }));
        }
      });

      chatSocket.on(SOCKET_EVENTS.CHAT_DELETED, (data: any) => {
        dispatch(removeMessage({ roomId: data.roomId, messageId: data.messageId }));
      });

      chatSocket.on(SOCKET_EVENTS.CHAT_HISTORY_RESULT, (data: any) => {
        if (data.roomId && data.messages) {
          dispatch(setMessages({ roomId: data.roomId, messages: data.messages }));
        }
      });

      // Typing
      chatSocket.on(SOCKET_EVENTS.CHAT_TYPING_INDICATOR, (data: any) => {
        dispatch(
          setTypingUser({ roomId: data.roomId, userId: data.userId, userName: data.userName }),
        );
        // Auto-remove typing after 3s
        setTimeout(() => {
          dispatch(removeTypingUser({ roomId: data.roomId, userId: data.userId }));
        }, 3000);
      });

      // Presence
      chatSocket.on(SOCKET_EVENTS.PRESENCE_ONLINE, (data: any) => {
        dispatch(addOnlineUser(data.userId));
      });

      chatSocket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, (data: any) => {
        dispatch(removeOnlineUser(data.userId));
      });

      chatSocket.on(SOCKET_EVENTS.PRESENCE_LIST_RESULT, (data: any) => {
        dispatch(setOnlineUsers(data.users || []));
      });

      // Request online users list
      chatSocket.emit(SOCKET_EVENTS.PRESENCE_LIST);
    }

    if (notifSocket) {
      notifSocket.on(SOCKET_EVENTS.NOTIFICATION_UNREAD, (data: any) => {
        dispatch(setNotifications(data.notifications || []));
        dispatch(setUnreadCount(data.notifications?.length || 0));
      });

      notifSocket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (data: any) => {
        dispatch(addNotification(data.notification));
      });
    }

    return () => {
      disconnectSockets();
      connectedRef.current = false;
    };
  }, [isAuthenticated, accessToken, dispatch]);
}
