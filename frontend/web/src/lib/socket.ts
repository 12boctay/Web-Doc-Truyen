'use client';

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

let chatSocket: Socket | null = null;
let notificationSocket: Socket | null = null;

export function connectSockets(token: string) {
  if (chatSocket?.connected) return;

  chatSocket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  notificationSocket = io(`${SOCKET_URL}/notifications`, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  chatSocket.on('connect', () => {
    console.log('Chat socket connected');
  });

  notificationSocket.on('connect', () => {
    console.log('Notification socket connected');
  });
}

export function disconnectSockets() {
  chatSocket?.disconnect();
  notificationSocket?.disconnect();
  chatSocket = null;
  notificationSocket = null;
}

export function getChatSocket(): Socket | null {
  return chatSocket;
}

export function getNotificationSocket(): Socket | null {
  return notificationSocket;
}
