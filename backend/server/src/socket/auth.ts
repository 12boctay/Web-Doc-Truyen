import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { redis } from '../config/redis';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
}

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token as string | undefined;

  if (!token) {
    return next(new Error('Authentication error: token required'));
  }

  try {
    // Check if token is blacklisted
    redis.get(`bl:${token}`).then((blacklisted) => {
      if (blacklisted) {
        return next(new Error('Authentication error: token revoked'));
      }

      const payload = verifyAccessToken(token);
      (socket as AuthenticatedSocket).userId = payload.userId;
      (socket as AuthenticatedSocket).userRole = payload.role;
      next();
    }).catch(() => {
      return next(new Error('Authentication error: token validation failed'));
    });
  } catch {
    return next(new Error('Authentication error: invalid token'));
  }
}
