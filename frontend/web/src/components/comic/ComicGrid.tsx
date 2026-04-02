'use client';

import ComicCard from './ComicCard';

interface Comic {
  _id: string;
  title: string;
  slug: string;
  coverUrl: string;
  country: string;
  latestChapter: {
    number: number;
    updatedAt: string;
  };
  views: number;
}

interface ComicGridProps {
  comics: Comic[];
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="w-full aspect-[200/280] bg-gray-300" />
      <div className="p-2 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function ComicGrid({ comics, isLoading }: ComicGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {isLoading
        ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        : comics.map((comic) => <ComicCard key={comic._id} comic={comic} />)}
    </div>
  );
}
