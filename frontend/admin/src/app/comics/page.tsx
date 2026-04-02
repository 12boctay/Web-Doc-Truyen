'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Table, Pagination, Modal, Toast } from '@webdoctruyen/ui';

interface Comic {
  _id: string;
  title: string;
  slug: string;
  country: string;
  status: string;
  chaptersCount?: number;
  views: number;
}

interface ComicsResponse {
  data: Comic[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export default function ComicsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Comic | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading } = useQuery<ComicsResponse>({
    queryKey: ['comics', page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.keyword = search;
      const { data } = await api.get('/comics', { params });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/comics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comics'] });
      setDeleteTarget(null);
      setToast({ message: 'Xoá truyện thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xoá truyện thất bại', type: 'error' });
    },
  });

  const comics = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const columns = [
    { key: 'title', header: 'Tiêu đề' },
    { key: 'country', header: 'Quốc gia' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (comic: Comic) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            comic.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : comic.status === 'ongoing'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          {comic.status}
        </span>
      ),
    },
    {
      key: 'chaptersCount',
      header: 'Chapters',
      render: (comic: Comic) => comic.chaptersCount ?? 0,
    },
    {
      key: 'views',
      header: 'Views',
      render: (comic: Comic) => comic.views?.toLocaleString() ?? 0,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (comic: Comic) => (
        <div className="flex gap-2">
          <Link href={`/comics/${comic._id}/edit`}>
            <Button variant="outline" size="sm">
              Sửa
            </Button>
          </Link>
          <Link href={`/chapters/${comic._id}`}>
            <Button variant="ghost" size="sm">
              Chapters
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(comic)}>
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý truyện</h1>
        <Link href="/comics/create">
          <Button>Thêm truyện</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Tìm kiếm theo tên truyện..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <>
          <Table columns={columns} data={comics} keyExtractor={(c) => c._id} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
        </>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá"
      >
        <p className="mb-4 text-sm text-gray-600">
          Bạn có chắc muốn xoá truyện <strong>{deleteTarget?.title}</strong>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Huỷ
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
          >
            Xoá
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
