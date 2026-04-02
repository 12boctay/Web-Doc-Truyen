'use client';

import { useState } from 'react';
import { useRankings } from '@/hooks/useRankings';
import Link from 'next/link';

const TABS = [
  { key: 'daily', label: 'Top ngày' },
  { key: 'weekly', label: 'Top tuần' },
  { key: 'monthly', label: 'Top tháng' },
  { key: 'all-time', label: 'Top tổng' },
  { key: 'top-follow', label: 'Top theo dõi' },
  { key: 'top-rating', label: 'Top đánh giá' },
];

export default function RankingsPage() {
  const [tab, setTab] = useState('daily');
  const { data: comics, isLoading } = useRankings(tab);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Bảng xếp hạng</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(comics || []).map((comic: any, index: number) => (
            <Link
              key={comic._id}
              href={`/truyen/${comic.slug}`}
              className="flex items-center gap-4 rounded-lg border p-3 hover:bg-gray-50"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  index < 3 ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                {index + 1}
              </span>
              {comic.coverUrl && (
                <img src={comic.coverUrl} alt="" className="h-12 w-9 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{comic.title}</p>
                <p className="text-xs text-gray-500">
                  {comic.country} · Ch. {comic.latestChapter?.number || 0}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                {tab.includes('follow') && `${comic.followers} followers`}
                {tab.includes('rating') && `${comic.rating?.average?.toFixed(1)} ★`}
                {!tab.includes('follow') && !tab.includes('rating') &&
                  `${(comic.views?.[tab === 'all-time' ? 'total' : tab] || 0).toLocaleString()} views`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
