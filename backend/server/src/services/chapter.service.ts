import { Chapter } from '../models/Chapter';
import { Comic } from '../models/Comic';

export async function getChapterBySlugs(
  comicSlug: string,
  chapSlug: string,
): Promise<Record<string, unknown>> {
  const comic = await Comic.findOne({ slug: comicSlug, isActive: true }).lean();
  if (!comic) throw { status: 404, message: 'Comic not found' };

  const chapter = await Chapter.findOne({ comicId: comic._id, slug: chapSlug }).lean();
  if (!chapter) throw { status: 404, message: 'Chapter not found' };

  // Increment views
  await Promise.all([
    Chapter.findByIdAndUpdate(chapter._id, { $inc: { views: 1 } }),
    Comic.findByIdAndUpdate(comic._id, {
      $inc: { 'views.total': 1, 'views.daily': 1, 'views.weekly': 1, 'views.monthly': 1 },
    }),
  ]);

  return { ...chapter, comic: { title: comic.title, slug: comic.slug } };
}

export async function createChapter(input: {
  comicId: string;
  number: number;
  title: string;
  slug?: string;
  pages: { pageNumber: number; imageUrl: string; width: number; height: number }[];
}) {
  if (!input.slug) {
    input.slug = `chapter-${input.number}`;
  }
  const chapter = await Chapter.create(input);

  await Comic.findByIdAndUpdate(input.comicId, {
    $inc: { totalChapters: 1 },
    latestChapter: {
      number: input.number,
      title: input.title,
      updatedAt: new Date(),
    },
    updatedAt: new Date(),
  });

  return chapter;
}

export async function updateChapter(id: string, input: Record<string, unknown>) {
  const chapter = await Chapter.findByIdAndUpdate(id, input, { new: true });
  if (!chapter) throw { status: 404, message: 'Chapter not found' };
  return chapter;
}

export async function deleteChapter(id: string) {
  const chapter = await Chapter.findById(id);
  if (!chapter) throw { status: 404, message: 'Chapter not found' };

  await chapter.deleteOne();
  await Comic.findByIdAndUpdate(chapter.comicId, { $inc: { totalChapters: -1 } });
  return chapter;
}
