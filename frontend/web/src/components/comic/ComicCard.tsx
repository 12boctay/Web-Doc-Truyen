'use client';

import Link from 'next/link';
import { formatRelativeTime } from '@webdoctruyen/shared-fe';
import { proxyImageUrl } from '@/lib/imageProxy';

interface ComicCardProps {
  comic: {
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
  };
}

const countryBadgeColors: Record<string, string> = {
  manga: 'bg-red-500',
  manhwa: 'bg-blue-500',
  manhua: 'bg-green-500',
};

export default function ComicCard({ comic }: ComicCardProps) {
  const badgeColor = countryBadgeColors[comic.country] ?? 'bg-gray-500';

  return (
    <Link
      href={`/truyen/${comic.slug}`}
      className="group block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.03]"
    >
      <div className="relative w-full aspect-[200/280]">
        <img
          src={proxyImageUrl(comic.coverUrl)}
          alt={comic.title}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 right-2 text-white text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}
        >
          {comic.country}
        </span>
      </div>

      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
          {comic.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>Ch. {comic.latestChapter.number}</span>
          <span>{formatRelativeTime(comic.latestChapter.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
