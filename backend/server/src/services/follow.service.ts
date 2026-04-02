import { Follow } from '../models/Follow';
import { Comic } from '../models/Comic';

export async function follow(userId: string, comicId: string) {
  const existing = await Follow.findOne({ userId, comicId });
  if (existing) {
    throw { status: 409, message: 'Already following this comic' };
  }

  const follow = await Follow.create({ userId, comicId });
  await Comic.findByIdAndUpdate(comicId, { $inc: { followers: 1 } });

  return follow;
}

export async function unfollow(userId: string, comicId: string) {
  const deleted = await Follow.findOneAndDelete({ userId, comicId });
  if (!deleted) {
    throw { status: 404, message: 'Not following this comic' };
  }

  await Comic.findByIdAndUpdate(comicId, { $inc: { followers: -1 } });

  return deleted;
}

export async function listFollows(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Follow.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('comicId', 'title slug coverUrl latestChapter')
      .lean(),
    Follow.countDocuments({ userId }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
