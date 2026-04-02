import { Rating } from '../models/Rating';
import { Comic } from '../models/Comic';

export async function rateComic(userId: string, comicId: string, score: number) {
  if (score < 1 || score > 5) {
    throw { status: 400, message: 'Score must be between 1 and 5' };
  }

  await Rating.findOneAndUpdate({ userId, comicId }, { score }, { upsert: true, new: true });

  const [agg] = await Rating.aggregate([
    { $match: { comicId: new (await import('mongoose')).Types.ObjectId(comicId) } },
    { $group: { _id: null, average: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);

  const average = agg ? Math.round(agg.average * 10) / 10 : 0;
  const count = agg ? agg.count : 0;

  await Comic.findByIdAndUpdate(comicId, {
    'rating.average': average,
    'rating.count': count,
  });

  return { average, count };
}

export async function getComicRating(comicId: string) {
  const comic = await Comic.findById(comicId).select('rating').lean();
  if (!comic) throw { status: 404, message: 'Comic not found' };
  return { average: comic.rating.average, count: comic.rating.count };
}

export async function getMyRating(userId: string, comicId: string) {
  const rating = await Rating.findOne({ userId, comicId }).lean();
  return rating || null;
}
