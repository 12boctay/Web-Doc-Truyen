import { Comic } from '../models/Comic';
import { Chapter } from '../models/Chapter';
import { redis } from '../config/redis';

interface ListComicsParams {
  page?: number;
  limit?: number;
  country?: string;
  category?: string;
  status?: string;
  sort?: string;
}

function getSortOption(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case 'popular':
      return { 'views.total': -1 };
    case 'top-daily':
      return { 'views.daily': -1 };
    case 'top-weekly':
      return { 'views.weekly': -1 };
    case 'top-monthly':
      return { 'views.monthly': -1 };
    case 'latest':
    default:
      return { updatedAt: -1 };
  }
}

export async function listComics(params: ListComicsParams) {
  const { page = 1, limit = 20, country, category, status, sort } = params;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { isActive: true };
  if (country) filter.country = country;
  if (status) filter.status = status;
  if (category) {
    const { Category } = await import('../models/Category.js');
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.categories = cat._id;
  }

  const cacheKey = `comics:list:${JSON.stringify({ ...params, page, limit })}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const [data, total] = await Promise.all([
    Comic.find(filter)
      .sort(getSortOption(sort))
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name slug')
      .lean(),
    Comic.countDocuments(filter),
  ]);

  const result = {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
  return result;
}

export async function getComicBySlug(slug: string) {
  const cacheKey = `comic:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const comic = await Comic.findOne({ slug, isActive: true })
    .populate('categories', 'name slug')
    .lean();

  if (!comic) throw { status: 404, message: 'Comic not found' };

  await redis.set(cacheKey, JSON.stringify(comic), 'EX', 600);
  return comic;
}

export async function getComicChapters(slug: string) {
  const comic = await Comic.findOne({ slug, isActive: true }).lean();
  if (!comic) throw { status: 404, message: 'Comic not found' };

  return Chapter.find({ comicId: comic._id })
    .select('number title slug createdAt')
    .sort({ number: -1 })
    .lean();
}

export async function getHotComics() {
  const cacheKey = 'comics:hot';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await Comic.find({ isActive: true })
    .sort({ 'views.weekly': -1 })
    .limit(10)
    .populate('categories', 'name slug')
    .lean();

  await redis.set(cacheKey, JSON.stringify(data), 'EX', 900);
  return data;
}

export async function getRecommendedComics() {
  const cacheKey = 'comics:recommended';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await Comic.find({ isActive: true, 'rating.count': { $gte: 5 } })
    .sort({ 'rating.average': -1 })
    .limit(10)
    .populate('categories', 'name slug')
    .lean();

  await redis.set(cacheKey, JSON.stringify(data), 'EX', 900);
  return data;
}

export async function createComic(input: Record<string, unknown>) {
  const comic = await Comic.create(input);
  await bustListCache();
  return comic;
}

export async function updateComic(id: string, input: Record<string, unknown>) {
  const comic = await Comic.findByIdAndUpdate(id, input, { new: true });
  if (!comic) throw { status: 404, message: 'Comic not found' };
  await bustComicCache(comic.slug);
  return comic;
}

export async function deleteComic(id: string) {
  const comic = await Comic.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!comic) throw { status: 404, message: 'Comic not found' };
  await bustComicCache(comic.slug);
  return comic;
}

async function bustComicCache(slug: string) {
  await redis.del(`comic:${slug}`);
  await bustListCache();
}

async function bustListCache() {
  const keys = await redis.keys('comics:*');
  if (keys.length > 0) await redis.del(...keys);
}
