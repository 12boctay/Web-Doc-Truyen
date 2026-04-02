'use client';

import { useState } from 'react';
import { useSearch, useSuggest } from '@/hooks/useSearch';
import ComicGrid from '@/components/comic/ComicGrid';
import { Pagination } from '@webdoctruyen/ui';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: suggestions } = useSuggest(query);
  const { data, isLoading } = useSearch(searchQuery, page);

  const handleSearch = () => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Tìm kiếm</h1>

      <div className="relative mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập tên truyện..."
            className="flex-1 rounded-lg border px-4 py-2"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Tìm
          </button>
        </div>

        {suggestions && suggestions.length > 0 && query.length >= 2 && !searchQuery && (
          <div className="absolute left-0 right-12 top-full z-10 mt-1 rounded-lg border bg-white shadow-lg">
            {suggestions.map((s: any) => (
              <Link
                key={s.slug}
                href={`/truyen/${s.slug}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
              >
                {s.coverUrl && <img src={s.coverUrl} alt="" className="h-10 w-8 rounded object-cover" />}
                <span className="text-sm">{s.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {searchQuery && (
        <>
          <p className="mb-4 text-sm text-gray-500">
            Kết quả cho &quot;{searchQuery}&quot;: {data?.pagination?.total || 0} truyện
          </p>
          <ComicGrid comics={data?.data || []} isLoading={isLoading} />
          {data?.pagination && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
}
