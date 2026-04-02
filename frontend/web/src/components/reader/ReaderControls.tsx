'use client';

interface ChapterInfo {
  number: number;
  slug: string;
}

interface ReaderControlsProps {
  comicSlug: string;
  currentChapter: number;
  chapters: ChapterInfo[];
  onPrev: () => void;
  onNext: () => void;
}

export default function ReaderControls({
  comicSlug,
  currentChapter,
  chapters,
  onPrev,
  onNext,
}: ReaderControlsProps) {
  const sorted = [...chapters].sort((a, b) => a.number - b.number);
  const currentIndex = sorted.findIndex((ch) => ch.number === currentChapter);
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= sorted.length - 1;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterNum = Number(e.target.value);
    const chapter = sorted.find((ch) => ch.number === chapterNum);
    if (chapter) {
      window.location.href = `/truyen/${comicSlug}/chapter-${chapter.number}`;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2 gap-2">
        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-3 py-2 text-sm font-medium text-white rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Tr&#432;&#7899;c
        </button>

        {/* Chapter select */}
        <select
          value={currentChapter}
          onChange={handleChapterChange}
          className="flex-1 max-w-[200px] px-3 py-2 text-sm bg-gray-700 text-white rounded-lg border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {sorted.map((ch) => (
            <option key={ch.number} value={ch.number}>
              Chapter {ch.number}
            </option>
          ))}
        </select>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={isLast}
          className="px-3 py-2 text-sm font-medium text-white rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Ti&#7871;p &rarr;
        </button>

        {/* Scroll to top */}
        <button
          onClick={scrollToTop}
          className="px-3 py-2 text-sm text-white rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
