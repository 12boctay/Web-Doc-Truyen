import { chromium, type Browser, type Page } from 'playwright';
import type { ComicInfo, ChapterInfo, PageInfo } from '../types.js';
import { uploadImage } from './storage.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

export abstract class BaseCrawler {
  protected siteName: string;

  constructor(siteName: string) {
    this.siteName = siteName;
  }

  /** Launch a browser and navigate to URL, returns page */
  protected async openPage(url: string): Promise<{ browser: Browser; page: Page }> {
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await browser.newContext({
      userAgent: this.getRandomUserAgent(),
    });

    const page = await context.newPage();

    // Hide webdriver
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return { browser, page };
  }

  /** Random delay between min and max ms */
  protected async randomDelay(minMs = 2000, maxMs = 5000): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /** Get random user agent */
  protected getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  /** Download image from URL as buffer */
  public async downloadImage(url: string, referer?: string): Promise<Buffer> {
    const headers: Record<string, string> = {
      'User-Agent': this.getRandomUserAgent(),
    };
    if (referer) {
      headers['Referer'] = referer;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Upload image buffer to Firebase Storage */
  public async uploadToFirebase(buffer: Buffer, comicSlug: string, chapterSlug: string, pageNumber: number): Promise<string> {
    const path = `chapters/${comicSlug}/${chapterSlug}/${String(pageNumber).padStart(3, '0')}.jpg`;
    return uploadImage(buffer, path);
  }

  /** Retry a function with exponential backoff */
  protected async retry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err as Error;
        console.warn(`Retry ${i + 1}/${maxRetries} failed: ${lastError.message}`);
        if (i < maxRetries - 1) {
          await this.randomDelay(1000 * (i + 1), 3000 * (i + 1));
        }
      }
    }
    throw lastError;
  }

  /** Slugify a string */
  protected slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Scroll to bottom of page to trigger lazy-loading */
  protected async scrollToBottom(page: Page, stepMs = 300): Promise<void> {
    await page.evaluate(async (step) => {
      await new Promise<void>((resolve) => {
        var totalHeight = 0;
        var distance = 400;
        var timer = setInterval(function () {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, step);
      });
    }, stepMs);
  }

  // Abstract methods each site must implement
  abstract getComicInfo(url: string): Promise<ComicInfo>;
  abstract getChapterList(url: string): Promise<ChapterInfo[]>;
  abstract getChapterImages(url: string): Promise<PageInfo[]>;
}
