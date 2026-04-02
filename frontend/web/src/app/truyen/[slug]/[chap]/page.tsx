'use client';

import { use, useEffect } from 'react';
import { useChapter } from '@/hooks/useChapter';
import { useComicChapters } from '@/hooks/useComics';
import { useSaveProgress } from '@/hooks/useHistory';
import ChapterReader from '@/components/reader/ChapterReader';
import ReaderControls from '@/components/reader/ReaderControls';
import { useRouter } from 'next/navigation';

export default function ChapterPage({ params }: { params: Promise<{ slug: string; chap: string }> }) {
  const { slug, chap } = use(params);
  const { data: chapter, isLoading } = useChapter(slug, chap);
  const { data: chapters } = useComicChapters(slug);
  const saveProgress = useSaveProgress();
  const router = useRouter();

  useEffect(() => {
    if (!chapter) return;
    const interval = setInterval(() => {
      saveProgress.mutate({
        comicId: chapter.comic?._id || '',
        chapterId: chapter._id,
        chapterNumber: chapter.number,
        scrollPosition: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) || 0,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [chapter]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  if (!chapter) {
    return <div className="py-20 text-center text-gray-500">Chapter không tồn tại</div>;
  }

  const currentNum = chapter.number;
  const sortedChapters = (chapters || []).sort((a: any, b: any) => a.number - b.number);
  const currentIndex = sortedChapters.findIndex((c: any) => c.number === currentNum);

  const handlePrev = () => {
    if (currentIndex > 0) {
      router.push(`/truyen/${slug}/${sortedChapters[currentIndex - 1].slug}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedChapters.length - 1) {
      router.push(`/truyen/${slug}/${sortedChapters[currentIndex + 1].slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-16">
      <div className="mx-auto max-w-4xl px-2 py-4">
        <h1 className="mb-4 text-center text-lg text-white">
          {chapter.comic?.title} - Chapter {chapter.number}
        </h1>
        <ChapterReader pages={chapter.pages || []} />
      </div>
      <ReaderControls
        comicSlug={slug}
        currentChapter={currentNum}
        chapters={sortedChapters}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
