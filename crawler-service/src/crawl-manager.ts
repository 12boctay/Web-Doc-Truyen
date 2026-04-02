import { config } from './config.js';
import { getCrawler } from './sites/index.js';
import type { CrawlStatus, ComicInfo, ChapterInfo, PageInfo } from './types.js';

class CrawlManager {
  private status: CrawlStatus = {
    isRunning: false,
    currentComic: null,
    progress: { completed: 0, total: 0 },
    errors: [],
    startedAt: null,
  };

  getStatus(): CrawlStatus {
    return { ...this.status };
  }

  async crawlOne(sourceUrl: string, siteName: string, maxChapters: number = 100): Promise<void> {
    this.status = {
      isRunning: true,
      currentComic: sourceUrl,
      progress: { completed: 0, total: 1 },
      errors: [],
      startedAt: new Date(),
    };

    try {
      await this.processComic(sourceUrl, siteName, maxChapters);
      this.status.progress.completed = 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.status.errors.push(`${sourceUrl}: ${msg}`);
      console.error(`Crawl failed for ${sourceUrl}:`, msg);
    } finally {
      this.status.isRunning = false;
      this.status.currentComic = null;
      await this.sendStatusWebhook();
    }
  }

  async crawlAll(comicUrls: string[], siteName: string): Promise<void> {
    this.status = {
      isRunning: true,
      currentComic: null,
      progress: { completed: 0, total: comicUrls.length },
      errors: [],
      startedAt: new Date(),
    };

    const crawler = getCrawler(siteName);

    for (const url of comicUrls) {
      this.status.currentComic = url;

      try {
        await this.processComic(url, siteName);
        this.status.progress.completed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.status.errors.push(`${url}: ${msg}`);
        console.error(`Crawl failed for ${url}:`, msg);
      }

      // Random delay between comics (5-10s)
      if (comicUrls.indexOf(url) < comicUrls.length - 1) {
        const delay = 5000 + Math.random() * 5000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    this.status.isRunning = false;
    this.status.currentComic = null;
    await this.sendStatusWebhook();
  }

  private async processComic(sourceUrl: string, siteName: string, maxChapters: number = 100): Promise<void> {
    const crawler = getCrawler(siteName);

    // 1. Get comic info
    console.log(`[Crawl] Getting comic info: ${sourceUrl}`);
    const comicInfo = await crawler.getComicInfo(sourceUrl);
    console.log(`[Crawl] Comic: ${comicInfo.title}`);

    // 2. Send comic info to backend
    await this.sendWebhook('/api/webhooks/crawler/new-comic', {
      comic: comicInfo,
      siteName,
    });

    // 3. Get chapter list
    console.log(`[Crawl] Getting chapter list...`);
    const chapters = await crawler.getChapterList(sourceUrl);
    console.log(`[Crawl] Found ${chapters.length} chapters`);

    // 4. Process latest N chapters only
    const latestChapters = chapters.slice(-maxChapters);
    console.log(`[Crawl] Processing latest ${latestChapters.length} of ${chapters.length} chapters`);

    for (const chapter of latestChapters) {
      try {
        console.log(`[Crawl] Processing chapter ${chapter.chapterNumber}: ${chapter.title}`);

        const pages = await crawler.getChapterImages(chapter.sourceUrl);
        console.log(`[Crawl] Found ${pages.length} pages`);

        // 5. Use original image URLs directly (no upload)
        const uploadedPages: PageInfo[] = pages.map((p) => ({ ...p, firebaseUrl: p.imageUrl }));

        // 6. Send chapter data to backend
        await this.sendWebhook('/api/webhooks/crawler/new-chapter', {
          comic: comicInfo,
          chapter,
          pages: uploadedPages,
          siteName,
        });

        // Delay between chapters
        const delay = 2000 + Math.random() * 3000;
        await new Promise((r) => setTimeout(r, delay));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Failed chapter ${chapter.chapterNumber}: ${msg}`);
        this.status.errors.push(`Chapter ${chapter.chapterNumber}: ${msg}`);
      }
    }
  }

  private async sendWebhook(path: string, data: unknown): Promise<void> {
    try {
      const url = `${config.BACKEND_URL}${path}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': config.WEBHOOK_SECRET,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn(`Webhook ${path} returned ${response.status}`);
      }
    } catch (err) {
      console.error(`Webhook ${path} failed:`, err);
    }
  }

  private async sendStatusWebhook(): Promise<void> {
    await this.sendWebhook('/api/webhooks/crawler/status', this.status);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const crawlManager = new CrawlManager();
