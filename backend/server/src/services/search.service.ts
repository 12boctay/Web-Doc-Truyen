import { Comic } from '../models/Comic';

export async function searchComics(query: string, page = 1, limit = 20) {
  if (!query || query.trim().length === 0) {
    throw { status: 400, message: 'Search query is required' };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Comic.find({ $text: { $search: query }, isActive: true }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name slug')
      .lean(),
    Comic.countDocuments({ $text: { $search: query }, isActive: true }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function suggestComics(query: string) {
  if (!query || query.trim().length < 2) return [];

  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  return Comic.find({
    isActive: true,
    $or: [{ title: regex }, { otherNames: regex }],
  })
    .select('title slug coverUrl')
    .limit(5)
    .lean();
}
