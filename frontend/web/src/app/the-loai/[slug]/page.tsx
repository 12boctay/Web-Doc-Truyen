'use client';

import { use, useState } from 'react';
import { useComics } from '@/hooks/useComics';
import ComicGrid from '@/components/comic/ComicGrid';
import { Pagination } from '@webdoctruyen/ui';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useComics({ page, limit: 24, category: slug });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold capitalize">{slug.replace(/-/g, ' ')}</h1>
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
