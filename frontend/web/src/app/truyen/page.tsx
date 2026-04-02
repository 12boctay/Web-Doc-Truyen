'use client';

import { useState } from 'react';
import { useComics } from '@/hooks/useComics';
import ComicGrid from '@/components/comic/ComicGrid';
import { Pagination } from '@webdoctruyen/ui';

export default function ComicsPage() {
  const [page, setPage] = useState(1);
  const [country, setCountry] = useState('');
  const [sort, setSort] = useState('latest');

  const { data, isLoading } = useComics({ page, limit: 24, country: country || undefined, sort });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Danh sách truyện</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={country}
          onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="manga">Manga</option>
          <option value="manhwa">Manhwa</option>
          <option value="manhua">Manhua</option>
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="latest">Mới cập nhật</option>
          <option value="popular">Phổ biến</option>
          <option value="top-daily">Top ngày</option>
          <option value="top-weekly">Top tuần</option>
          <option value="top-monthly">Top tháng</option>
        </select>
      </div>

      <ComicGrid comics={data?.data || []} isLoading={isLoading} />

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
          className="mt-6"
        />
      )}
    </div>
  );
}
