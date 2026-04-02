import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';
import { initFirebase } from './config/firebase';
import { initSocketServer } from './socket';

async function main() {
  await connectDatabase();

  await redis.ping();
  console.log('Redis ping: OK');

  initFirebase();

  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
