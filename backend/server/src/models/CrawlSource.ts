import mongoose, { Schema, Document } from 'mongoose';
import type { ICrawlSource } from '@webdoctruyen/shared-be';

export interface CrawlSourceDocument extends Omit<ICrawlSource, '_id'>, Document {}

const crawlSourceSchema = new Schema<CrawlSourceDocument>({
  name: { type: String, required: true },
  baseUrl: { type: String, required: true },
  selectors: {
    comicList: { type: String, default: '' },
    comicTitle: { type: String, default: '' },
    comicCover: { type: String, default: '' },
    comicDescription: { type: String, default: '' },
    comicAuthor: { type: String, default: '' },
    comicCategories: { type: String, default: '' },
    chapterList: { type: String, default: '' },
    chapterTitle: { type: String, default: '' },
    chapterImages: { type: String, default: '' },
  },
  headers: { type: Schema.Types.Mixed, default: {} },
  schedule: { type: String, default: '*/30 * * * *' },
  isActive: { type: Boolean, default: true },
  lastCrawlAt: { type: Date, default: null },
  lastError: { type: String, default: '' },
  stats: {
    totalCrawled: { type: Number, default: 0 },
    totalErrors: { type: Number, default: 0 },
    lastSuccessAt: { type: Date, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});

export const CrawlSource = mongoose.model<CrawlSourceDocument>('CrawlSource', crawlSourceSchema);
