import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { socketAuthMiddleware } from './auth';
import { registerChatHandlers } from './chat.handler';
import { registerNotificationHandlers } from './notification.handler';
import { seedGlobalRoom } from '../services/chat.service';

let io: Server;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  const chatNamespace = io.of('/chat');
  const notificationNamespace = io.of('/notifications');

  // Apply auth middleware to both namespaces
  chatNamespace.use(socketAuthMiddleware);
  notificationNamespace.use(socketAuthMiddleware);

  // Register event handlers
  chatNamespace.on('connection', (socket) => {
    registerChatHandlers(chatNamespace, socket as any);
  });

  notificationNamespace.on('connection', (socket) => {
    registerNotificationHandlers(notificationNamespace, socket as any);
  });

  // Seed the global chat room
  seedGlobalRoom().catch((err) => {
    console.error('Failed to seed global chat room:', err);
  });

  console.log('Socket.IO server initialized (/chat, /notifications)');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
