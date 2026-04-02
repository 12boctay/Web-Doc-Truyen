import express from 'express';
import { config } from './config.js';
import { crawlManager } from './crawl-manager.js';
import type { CrawlRequest, CrawlAllRequest } from './types.js';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'crawler-service' });
});

// Crawl single comic
app.post('/crawl', async (req, res) => {
  const { sourceUrl, siteName, maxChapters } = req.body as CrawlRequest & { maxChapters?: number };

  if (!sourceUrl || !siteName) {
    res.status(400).json({ error: 'sourceUrl and siteName are required' });
    return;
  }

  if (crawlManager.getStatus().isRunning) {
    res.status(409).json({ error: 'A crawl is already running' });
    return;
  }

  const limit = maxChapters && maxChapters > 0 ? maxChapters : 100;

  // Start crawl in background
  crawlManager.crawlOne(sourceUrl, siteName, limit).catch(console.error);

  res.json({ message: 'Crawl started', sourceUrl, siteName, maxChapters: limit });
});

// Crawl all comics
app.post('/crawl/all', async (req, res) => {
  const { siteName, comicUrls } = req.body as CrawlAllRequest;

  if (!siteName || !comicUrls?.length) {
    res.status(400).json({ error: 'siteName and comicUrls[] are required' });
    return;
  }

  if (crawlManager.getStatus().isRunning) {
    res.status(409).json({ error: 'A crawl is already running' });
    return;
  }

  // Start crawl in background
  crawlManager.crawlAll(comicUrls, siteName).catch(console.error);

  res.json({ message: 'Crawl all started', siteName, total: comicUrls.length });
});

// Crawl status
app.get('/crawl/status', (_req, res) => {
  res.json(crawlManager.getStatus());
});

app.listen(config.PORT, () => {
  console.log(`Crawler service running on port ${config.PORT}`);
});
