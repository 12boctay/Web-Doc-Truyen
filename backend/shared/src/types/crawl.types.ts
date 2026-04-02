export interface ICrawlSelectors {
  comicList: string;
  comicTitle: string;
  comicCover: string;
  comicDescription: string;
  comicAuthor: string;
  comicCategories: string;
  chapterList: string;
  chapterTitle: string;
  chapterImages: string;
}

export interface ICrawlStats {
  totalCrawled: number;
  totalErrors: number;
  lastSuccessAt: Date | null;
}

export interface ICrawlSource {
  _id: string;
  name: string;
  baseUrl: string;
  selectors: ICrawlSelectors;
  headers: Record<string, string>;
  schedule: string;
  isActive: boolean;
  lastCrawlAt: Date | null;
  lastError: string;
  stats: ICrawlStats;
  createdAt: Date;
}
