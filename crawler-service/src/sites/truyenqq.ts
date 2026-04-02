import { BaseCrawler } from '../core/base-crawler.js';
import type { ComicInfo, ChapterInfo, PageInfo } from '../types.js';

/**
 * TruyenQQ Crawler — truyenqq.com.vn (2026)
 *
 * Site structure:
 *   Homepage:  https://truyenqq.com.vn/
 *   Detail:    https://truyenqq.com.vn/{slug}
 *   Chapter:   https://truyenqq.com.vn/{slug}/chapter-{num}
 *   Search:    https://truyenqq.com.vn/tim-kiem?s={query}
 *   Category:  https://truyenqq.com.vn/the-loai/{name}
 *
 * Anti-bot: Cloudflare — requires headless: false + webdriver spoofing
 * Image CDN: s34.static3t.com/chapters/b{id}/chapter-{n}/{slug}-{index}.{ext}
 *
 * CSS Selectors:
 *   Title:       h1[itemprop="name"]
 *   Cover:       .poster img[itemprop="image"]
 *   Author:      .book-meta .line:first-child .result
 *   Status:      .label-status
 *   Categories:  .book-meta .result a[href*="the-loai"]
 *   Description: [itemprop="description"]
 *   Chapters:    a.chapter-name  (detail page)
 *                select.select-reading option  (chapter page — full list)
 *   Images:      .reading .inner img[data-src]
 */
export class TruyenQQCrawler extends BaseCrawler {
  constructor() {
    super('truyenqq');
  }

  async getComicInfo(url: string): Promise<ComicInfo> {
    const { browser, page } = await this.openPage(url);

    try {
      await page.waitForTimeout(3000);

      const info = await page.evaluate(() => {
        const title =
          document.querySelector('h1[itemprop="name"]')?.textContent?.trim() ||
          document.querySelector('h1')?.textContent?.trim() ||
          '';

        const coverUrl = document.querySelector('.poster img')?.getAttribute('src') || '';

        // Meta lines: Tác giả, Trạng thái, Thể loại, etc.
        const metaLines = Array.from(document.querySelectorAll('.book-meta .line'));
        let author = 'Unknown';
        let status: 'ongoing' | 'completed' = 'ongoing';
        const categories: string[] = [];

        for (const line of metaLines) {
          const label = line.querySelector('.title')?.textContent?.trim() || '';
          const result = line.querySelector('.result');
          if (!result) continue;

          if (label.includes('Tác giả')) {
            author = result.textContent?.trim() || 'Unknown';
          } else if (label.includes('Trạng thái')) {
            const statusEl = result.querySelector('.label-status');
            const statusText = statusEl?.textContent?.trim() || result.textContent?.trim() || '';
            status = statusText.includes('Hoàn thành') ? 'completed' : 'ongoing';
          } else if (label.includes('Thể loại')) {
            const links = result.querySelectorAll('a[href*="the-loai"]');
            links.forEach((a) => {
              const t = a.textContent?.trim();
              if (t) categories.push(t);
            });
          }
        }

        const description =
          document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';

        return { title, author, categories, description, coverUrl, status };
      });

      return {
        ...info,
        coverUrl: info.coverUrl.startsWith('http')
          ? info.coverUrl
          : new URL(info.coverUrl, url).href,
        sourceUrl: url,
      };
    } finally {
      await browser.close();
    }
  }

  async getChapterList(url: string): Promise<ChapterInfo[]> {
    const { browser, page } = await this.openPage(url);

    try {
      await page.waitForTimeout(3000);

      const chapters = await page.evaluate(() => {
        const results: { chapterNumber: number; title: string; sourceUrl: string }[] = [];
        const baseUrl = window.location.origin;

        // Method 1: chapter links on detail page
        const chapterLinks = document.querySelectorAll('a.chapter-name');
        chapterLinks.forEach((a) => {
          const href = a.getAttribute('href') || '';
          const text = a.textContent?.trim() || '';
          const numMatch = text.match(/(\d+(?:\.\d+)?)/);
          const chapterNumber = numMatch ? parseFloat(numMatch[1]) : 0;

          if (chapterNumber > 0) {
            results.push({
              chapterNumber,
              title: text,
              sourceUrl: href.startsWith('http') ? href : baseUrl + href,
            });
          }
        });

        // Method 2: if no chapter links found, try select dropdown
        if (results.length === 0) {
          const options = document.querySelectorAll('select.select-reading option');
          options.forEach((opt) => {
            const value = opt.getAttribute('value') || '';
            const text = opt.textContent?.trim() || '';
            const numMatch = text.match(/(\d+(?:\.\d+)?)/);
            const chapterNumber = numMatch ? parseFloat(numMatch[1]) : 0;

            if (chapterNumber > 0 && value) {
              results.push({
                chapterNumber,
                title: text,
                sourceUrl: value.startsWith('http') ? value : baseUrl + value,
              });
            }
          });
        }

        return results;
      });

      return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    } finally {
      await browser.close();
    }
  }

  async getChapterImages(url: string): Promise<PageInfo[]> {
    const { browser, page } = await this.openPage(url);

    try {
      await page.waitForTimeout(3000);

      // Scroll to trigger lazy loading
      await this.scrollToBottom(page, 200);
      await page.waitForTimeout(2000);

      const pages = await page.evaluate(() => {
        const results: { pageNumber: number; imageUrl: string }[] = [];

        // Primary: images inside .inner with data-src
        const imgs = document.querySelectorAll('.reading .inner img, .inner img[data-src]');

        imgs.forEach((img) => {
          const src =
            (img as HTMLImageElement).getAttribute('data-src') ||
            (img as HTMLImageElement).src ||
            '';

          if (
            src &&
            !src.includes('logo') &&
            !src.includes('data:') &&
            !src.includes('.svg') &&
            !src.includes('pixel') &&
            !src.includes('icon') &&
            !src.includes('ads')
          ) {
            results.push({
              pageNumber: results.length + 1,
              imageUrl: src,
            });
          }
        });

        // Fallback: any large images in main content
        if (results.length === 0) {
          const allImgs = document.querySelectorAll('img');
          allImgs.forEach((img) => {
            const src = img.getAttribute('data-src') || img.src || '';
            const w = img.naturalWidth || img.width;
            if (
              src &&
              w > 200 &&
              !src.includes('logo') &&
              !src.includes('data:') &&
              !src.includes('.svg') &&
              !src.includes('pixel')
            ) {
              results.push({
                pageNumber: results.length + 1,
                imageUrl: src,
              });
            }
          });
        }

        return results;
      });

      return pages;
    } finally {
      await browser.close();
    }
  }
}
