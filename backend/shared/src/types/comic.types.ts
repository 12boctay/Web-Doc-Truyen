export type ComicCountry = 'manga' | 'manhua' | 'manhwa' | 'comic';
export type ComicStatus = 'ongoing' | 'completed' | 'dropped';

export interface IComicViews {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export interface IComicRating {
  average: number;
  count: number;
}

export interface ILatestChapter {
  number: number;
  title: string;
  updatedAt: Date;
}

export interface IComic {
  _id: string;
  title: string;
  slug: string;
  otherNames: string[];
  description: string;
  coverUrl: string;
  author: string;
  artist: string;
  categories: string[];
  country: ComicCountry;
  status: ComicStatus;
  totalChapters: number;
  latestChapter: ILatestChapter;
  views: IComicViews;
  rating: IComicRating;
  followers: number;
  sourceUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChapterPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

export interface IChapter {
  _id: string;
  comicId: string;
  number: number;
  title: string;
  slug: string;
  pages: IChapterPage[];
  views: number;
  sourceUrl: string;
  createdAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  comicCount: number;
  createdAt: Date;
}
