import { Comic } from '../models/Comic';
import { redis } from '../config/redis';

type RankingType = 'daily' | 'weekly' | 'monthly' | 'all-time' | 'top-follow' | 'top-rating';

const sortMapping: Record<RankingType, Record<string, -1>> = {
  daily: { 'views.daily': -1 },
  weekly: { 'views.weekly': -1 },
  monthly: { 'views.monthly': -1 },
  'all-time': { 'views.total': -1 },
  'top-follow': { followers: -1 },
  'top-rating': { 'rating.average': -1 },
};

export async function getRanking(type: RankingType) {
  const cacheKey = `ranking:${type}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const sortOption = sortMapping[type];
  if (!sortOption) {
    throw { status: 400, message: 'Invalid ranking type' };
  }

  const data = await Comic.find({ isActive: true })
    .sort(sortOption)
    .limit(20)
    .populate('categories', 'name slug')
    .lean();

  await redis.set(cacheKey, JSON.stringify(data), 'EX', 900);
  return data;
}
