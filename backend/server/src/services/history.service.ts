import { ReadHistory } from '../models/ReadHistory';

interface SaveProgressInput {
  comicId: string;
  chapterId: string;
  chapterNumber: number;
  scrollPosition?: number;
}

export async function saveProgress(userId: string, input: SaveProgressInput) {
  const history = await ReadHistory.findOneAndUpdate(
    { userId, comicId: input.comicId },
    {
      chapterId: input.chapterId,
      chapterNumber: input.chapterNumber,
      scrollPosition: input.scrollPosition || 0,
      lastReadAt: new Date(),
    },
    { upsert: true, new: true },
  );

  return history;
}

export async function getHistory(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    ReadHistory.find({ userId })
      .sort({ lastReadAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('comicId', 'title slug coverUrl latestChapter')
      .lean(),
    ReadHistory.countDocuments({ userId }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function deleteHistory(userId: string, comicId: string) {
  const deleted = await ReadHistory.findOneAndDelete({ userId, comicId });
  if (!deleted) throw { status: 404, message: 'History entry not found' };
  return deleted;
}

export async function clearHistory(userId: string) {
  const result = await ReadHistory.deleteMany({ userId });
  return { deletedCount: result.deletedCount };
}
