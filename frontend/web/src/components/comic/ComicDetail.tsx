'use client';

import Link from 'next/link';
import { proxyImageUrl } from '@/lib/imageProxy';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ComicDetailProps {
  comic: {
    _id: string;
    title: string;
    slug: string;
    otherNames: string[];
    coverUrl: string;
    author: string;
    artist: string;
    categories: Category[];
    description: string;
    status: string;
    views: number;
    followers: number;
    rating: {
      average: number;
      count: number;
    };
  };
  isFollowing: boolean;
  myRating: number | null;
  onFollow: () => void;
  onRate: (rating: number) => void;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  ongoing: { text: 'Đang tiến hành', color: 'bg-green-100 text-green-700' },
  completed: { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-700' },
  dropped: { text: 'Tạm ngưng', color: 'bg-red-100 text-red-700' },
};

function StarRating({
  myRating,
  average,
  count,
  onRate,
}: {
  myRating: number | null;
  average: number;
  count: number;
  onRate: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className="focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              className={`w-6 h-6 ${
                star <= (myRating ?? 0)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              } hover:text-yellow-400 hover:fill-yellow-400 transition-colors`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {average.toFixed(1)} ({count} lượt)
      </span>
    </div>
  );
}

export default function ComicDetail({
  comic,
  isFollowing,
  myRating,
  onFollow,
  onRate,
}: ComicDetailProps) {
  const statusInfo = statusLabels[comic.status] ?? {
    text: comic.status,
    color: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Cover */}
      <div className="flex-shrink-0 mx-auto md:mx-0">
        <div className="relative w-[200px] h-[280px] rounded-lg overflow-hidden shadow-md">
          <img
            src={proxyImageUrl(comic.coverUrl)}
            alt={comic.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">{comic.title}</h1>

        {comic.otherNames.length > 0 && (
          <p className="text-sm text-gray-500">
            {comic.otherNames.join(' | ')}
          </p>
        )}

        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium text-gray-700">Tác giả:</span>{' '}
            {comic.author}
          </p>
          <p>
            <span className="font-medium text-gray-700">Họa sĩ:</span>{' '}
            {comic.artist}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {comic.categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/the-loai/${cat.slug}`}
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Status & Stats */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          <span className="text-gray-500">
            {comic.views.toLocaleString('vi-VN')} lượt xem
          </span>
          <span className="text-gray-500">
            {comic.followers.toLocaleString('vi-VN')} theo dõi
          </span>
        </div>

        {/* Rating */}
        <StarRating
          myRating={myRating}
          average={comic.rating.average}
          count={comic.rating.count}
          onRate={onRate}
        />

        {/* Follow Button */}
        <button
          onClick={onFollow}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
            isFollowing
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </button>

        {/* Description */}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {comic.description}
        </div>
      </div>
    </div>
  );
}
