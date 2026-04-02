import type { BaseCrawler } from '../core/base-crawler.js';
import { TruyenQQCrawler } from './truyenqq.js';

const crawlerRegistry: Record<string, BaseCrawler> = {
  truyenqq: new TruyenQQCrawler(),
};

export function getCrawler(siteName: string): BaseCrawler {
  const crawler = crawlerRegistry[siteName];
  if (!crawler) {
    throw new Error(`Unknown site: ${siteName}. Available: ${Object.keys(crawlerRegistry).join(', ')}`);
  }
  return crawler;
}

export function getAvailableSites(): string[] {
  return Object.keys(crawlerRegistry);
}
