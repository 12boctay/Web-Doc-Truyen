import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),
  FIREBASE_STORAGE_BUCKET: z.string().default(''),
  WEBHOOK_SECRET: z.string().default('crawler-webhook-secret'),
  N8N_URL: z.string().default('http://localhost:5678'),
  CRAWLER_SERVICE_URL: z.string().default('http://localhost:3002'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    console.error('Missing or invalid environment variables:\n' + errors.join('\n'));
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
