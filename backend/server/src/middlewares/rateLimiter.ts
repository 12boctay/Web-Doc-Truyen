import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<number | string>,
    prefix: 'rl:general:',
  }),
  message: { success: false, error: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<number | string>,
    prefix: 'rl:auth:',
  }),
  message: { success: false, error: 'Too many attempts, please try again later' },
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<number | string>,
    prefix: 'rl:refresh:',
  }),
  message: { success: false, error: 'Too many refresh attempts' },
});
