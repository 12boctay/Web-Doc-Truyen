import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { generalLimiter } from './middlewares/rateLimiter';
import { authRoutes } from './routes/auth.routes';
import { comicRoutes } from './routes/comic.routes';
import { chapterRoutes } from './routes/chapter.routes';
import { categoryRoutes } from './routes/category.routes';
import { searchRoutes } from './routes/search.routes';
import { uploadRoutes } from './routes/upload.routes';
import { followRoutes } from './routes/follow.routes';
import { commentRoutes } from './routes/comment.routes';
import { ratingRoutes } from './routes/rating.routes';
import { historyRoutes } from './routes/history.routes';
import { rankingRoutes } from './routes/ranking.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { n8nRoutes } from './routes/n8n.routes';
import { crawlSourceRoutes } from './routes/crawl-source.routes';
import { chatRoutes } from './routes/chat.routes';
import { notificationRoutes } from './routes/notification.routes';
import { paymentRoutes } from './routes/payment.routes';
import { donationGoalRoutes } from './routes/donation-goal.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Webhooks exempt from rate limiting (crawler sends many requests)
app.use('/api/webhooks', webhookRoutes);

app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Image proxy to bypass hotlink protection
app.get('/api/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }

    const parsed = new URL(imageUrl);
    const allowed = ['hinhhinh.com', 'truyenqqno.com', 'cdn3t.com', 'static3t.com'];
    if (!allowed.some((d) => parsed.hostname.endsWith(d))) {
      res.status(403).json({ error: 'Domain not allowed' });
      return;
    }

    const response = await fetch(imageUrl, {
      headers: {
        Referer: 'https://truyenqq.com.vn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ error: 'Upstream error' });
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error('[Image Proxy Error]', err);
    res.status(500).json({ error: 'Proxy error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/comics', comicRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/crawl-sources', crawlSourceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/donation-goals', donationGoalRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

export { app };
