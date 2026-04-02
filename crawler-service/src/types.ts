export interface ComicInfo {
  title: string;
  author: string;
  categories: string[];
  description: string;
  coverUrl: string;
  sourceUrl: string;
  status?: string;
}

export interface ChapterInfo {
  chapterNumber: number;
  title: string;
  sourceUrl: string;
}

export interface PageInfo {
  pageNumber: number;
  imageUrl: string;
  firebaseUrl?: string;
}

export interface CrawlResult {
  success: boolean;
  comic: ComicInfo;
  chapters: {
    info: ChapterInfo;
    pages: PageInfo[];
  }[];
  errors: string[];
}

export interface CrawlStatus {
  isRunning: boolean;
  currentComic: string | null;
  progress: {
    completed: number;
    total: number;
  };
  errors: string[];
  startedAt: Date | null;
}

export interface CrawlRequest {
  sourceUrl: string;
  siteName: string;
}

export interface CrawlAllRequest {
  siteName: string;
  comicUrls: string[];
}
