'use client';

import ImageLoader from './ImageLoader';

interface Page {
  pageNumber: number;
  imageUrl: string;
}

interface ChapterReaderProps {
  pages: Page[];
}

export default function ChapterReader({ pages }: ChapterReaderProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {pages.map((page) => (
        <ImageLoader
          key={page.pageNumber}
          src={page.imageUrl}
          alt={`Trang ${page.pageNumber}`}
          index={page.pageNumber}
        />
      ))}
    </div>
  );
}
