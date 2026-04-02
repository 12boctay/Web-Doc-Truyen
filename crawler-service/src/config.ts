import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
  WEBHOOK_SECRET: z.string().default('crawler-webhook-secret'),
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),
  FIREBASE_STORAGE_BUCKET: z.string().default(''),
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

export const config = validateEnv();
