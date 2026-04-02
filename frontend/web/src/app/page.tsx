'use client';

import { useComics, useHotComics, useRecommendedComics } from '@/hooks/useComics';
import ComicGrid from '@/components/comic/ComicGrid';
import Link from 'next/link';
import { ArrowRight, Flame, Star, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { data: latestData, isLoading: latestLoading } = useComics({ sort: 'latest', limit: 18 });
  const { data: hotComics } = useHotComics();
  const { data: recommended } = useRecommendedComics();

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Featured / Recommended */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <h2 className="text-xl tracking-wide text-primary">Truyện đề cử</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {recommended?.map((comic: any) => (
              <Link
                key={comic._id}
                href={`/truyen/${comic.slug}`}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[3/4] bg-surface-alt">
                  {comic.coverUrl && (
                    <img
                      src={comic.coverUrl}
                      alt={comic.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-medium text-text transition-colors duration-200 group-hover:text-accent">
                    {comic.title}
                  </p>
                </div>
              </Link>
            ))}
            {!recommended?.length && (
              <div className="col-span-full py-12 text-center text-sm text-text-faint">
                Chưa có truyện đề cử
              </div>
            )}
          </div>
        </section>

        {/* Latest Updates */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-xl tracking-wide text-primary">Mới cập nhật</h2>
            </div>
            <Link
              href="/truyen"
              className="flex cursor-pointer items-center gap-1 text-sm font-medium text-accent transition-colors duration-200 hover:text-accent-hover"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ComicGrid comics={latestData?.data || []} isLoading={latestLoading} />
        </section>
      </div>

      {/* Sidebar — Hot Comics */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-20 rounded-xl border border-border bg-surface p-4">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            <h3 className="text-lg tracking-wide text-primary">Truyện hot</h3>
          </div>
          <div className="flex flex-col gap-1">
            {hotComics?.map((comic: any, index: number) => (
              <Link
                key={comic._id}
                href={`/truyen/${comic.slug}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-surface-alt"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${
                    index === 0
                      ? 'bg-red-500'
                      : index === 1
                        ? 'bg-accent'
                        : index === 2
                          ? 'bg-amber-600'
                          : 'bg-secondary'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate text-sm font-medium text-text">{comic.title}</span>
              </Link>
            ))}
            {!hotComics?.length && (
              <p className="py-4 text-center text-sm text-text-faint">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
