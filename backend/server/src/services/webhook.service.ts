import { Comic } from '../models/Comic';
import { Chapter } from '../models/Chapter';
import { CrawlSource } from '../models/CrawlSource';
import { Follow } from '../models/Follow';
import { slugify } from '@webdoctruyen/shared-be';
import { Category } from '../models/Category';
import * as notificationService from './notification.service';
import { emitNotificationToUser } from '../socket/notification.handler';

interface CrawledComicData {
  comic: {
    title: string;
    author: string;
    categories: string[];
    description: string;
    coverUrl: string;
    sourceUrl: string;
    status?: string;
  };
  siteName: string;
}

interface CrawledChapterData {
  comic: {
    title: string;
    sourceUrl: string;
  };
  chapter: {
    chapterNumber: number;
    title: string;
    sourceUrl: string;
  };
  pages: {
    pageNumber: number;
    imageUrl: string;
    firebaseUrl?: string;
  }[];
  siteName: string;
}

interface CrawlStatusData {
  isRunning: boolean;
  currentComic: string | null;
  progress: { completed: number; total: number };
  errors: string[];
  startedAt: string | null;
}

export async function handleNewComic(data: CrawledComicData) {
  const { comic, siteName } = data;
  const slug = slugify(comic.title);

  // Find or resolve category ObjectIds
  const categoryIds = [];
  for (const catName of comic.categories) {
    const category = await Category.findOneAndUpdate(
      { name: catName },
      { name: catName, slug: slugify(catName) },
      { upsert: true, new: true },
    );
    categoryIds.push(category._id);
  }

  // Upsert comic by sourceUrl or slug
  const existing = await Comic.findOne({ $or: [{ sourceUrl: comic.sourceUrl }, { slug }] });

  if (existing) {
    existing.title = comic.title;
    existing.author = comic.author;
    existing.description = comic.description;
    existing.coverUrl = comic.coverUrl;
    existing.categories = categoryIds;
    if (comic.status) existing.status = comic.status as any;
    await existing.save();
    return existing;
  }

  // Create new comic — default country to 'manhua' for TruyenQQ
  const newComic = await Comic.create({
    title: comic.title,
    slug,
    author: comic.author,
    description: comic.description,
    coverUrl: comic.coverUrl,
    categories: categoryIds,
    country: 'manhua',
    status: comic.status || 'ongoing',
    sourceUrl: comic.sourceUrl,
  });

  return newComic;
}

export async function handleNewChapter(data: CrawledChapterData) {
  const { comic, chapter, pages } = data;

  // Find the comic by sourceUrl or title slug
  const titleSlug = slugify(comic.title);
  const comicDoc = await Comic.findOne({
    $or: [{ sourceUrl: comic.sourceUrl }, { slug: titleSlug }],
  });
  if (!comicDoc) {
    throw Object.assign(new Error(`Comic not found: ${comic.sourceUrl}`), { status: 404 });
  }
  // Update sourceUrl if it changed
  if (comicDoc.sourceUrl !== comic.sourceUrl) {
    comicDoc.sourceUrl = comic.sourceUrl;
    await comicDoc.save();
  }

  // Check if chapter already exists
  const existing = await Chapter.findOne({ comicId: comicDoc._id, number: chapter.chapterNumber });
  if (existing) {
    // Update pages if re-crawled
    existing.pages = pages.map((p) => ({
      pageNumber: p.pageNumber,
      imageUrl: p.firebaseUrl || p.imageUrl,
      width: 0,
      height: 0,
    }));
    existing.sourceUrl = chapter.sourceUrl;
    await existing.save();
    return existing;
  }

  // Create new chapter
  const chapterSlug = `chapter-${chapter.chapterNumber}`;
  const newChapter = await Chapter.create({
    comicId: comicDoc._id,
    number: chapter.chapterNumber,
    title: chapter.title,
    slug: chapterSlug,
    pages: pages.map((p) => ({
      pageNumber: p.pageNumber,
      imageUrl: p.firebaseUrl || p.imageUrl,
      width: 0,
      height: 0,
    })),
    sourceUrl: chapter.sourceUrl,
  });

  // Update comic's latestChapter and totalChapters
  const totalChapters = await Chapter.countDocuments({ comicId: comicDoc._id });
  comicDoc.totalChapters = totalChapters;

  if (chapter.chapterNumber > (comicDoc.latestChapter?.number || 0)) {
    comicDoc.latestChapter = {
      number: chapter.chapterNumber,
      title: chapter.title,
      updatedAt: new Date(),
    };
  }

  await comicDoc.save();

  // Notify followers about new chapter
  const followers = await Follow.find({
    comicId: comicDoc._id,
    notifyEnabled: true,
  }).lean();

  if (followers.length > 0) {
    const followerIds = followers.map((f) => f.userId.toString());
    const title = `Chương mới: ${comicDoc.title}`;
    const message = `${chapter.title || `Chapter ${chapter.chapterNumber}`} đã được cập nhật`;
    const data = { comicId: comicDoc._id.toString(), chapterId: newChapter._id.toString() };

    const notifications = await notificationService.createForMany(
      followerIds,
      'new_chapter',
      title,
      message,
      data,
    );

    // Emit real-time notifications to online users
    for (const notif of notifications) {
      emitNotificationToUser(notif.userId.toString(), notif);
    }
  }

  return newChapter;
}

export async function handleCrawlStatus(data: CrawlStatusData) {
  // Update CrawlSource stats if crawl finished
  if (!data.isRunning && data.startedAt) {
    // Update all active crawl sources with latest stats
    await CrawlSource.updateMany(
      { isActive: true },
      {
        lastCrawlAt: new Date(),
        lastError: data.errors.length > 0 ? data.errors.join('; ') : '',
        $inc: {
          'stats.totalCrawled': data.progress.completed,
          'stats.totalErrors': data.errors.length,
        },
        ...(data.errors.length === 0 ? { 'stats.lastSuccessAt': new Date() } : {}),
      },
    );
  }

  return { received: true };
}
