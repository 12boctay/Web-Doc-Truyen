'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Table, Modal, Toast } from '@webdoctruyen/ui';

interface Comic {
  _id: string;
  title: string;
  slug: string;
}

interface Chapter {
  _id: string;
  number: number;
  title: string;
  pages: { url: string }[];
  createdAt: string;
}

export default function ChaptersPage() {
  const params = useParams();
  const comicId = params.comicId as string;
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: comicData } = useQuery<{ data: Comic }>({
    queryKey: ['comic', comicId],
    queryFn: async () => {
      const { data } = await api.get(`/comics/${comicId}`);
      return data;
    },
  });

  const { data: chaptersData, isLoading } = useQuery<{ data: Chapter[] }>({
    queryKey: ['chapters', comicId],
    queryFn: async () => {
      const slug = comicData?.data?.slug || comicId;
      const { data } = await api.get(`/comics/${slug}/chapters`);
      return data;
    },
    enabled: !!comicData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      await api.delete(`/chapters/${chapterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', comicId] });
      setDeleteTarget(null);
      setToast({ message: 'Xoá chapter thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xoá chapter thất bại', type: 'error' });
    },
  });

  const chapters = chaptersData?.data ?? [];
  const comicTitle = comicData?.data?.title ?? 'Truyện';

  const columns = [
    {
      key: 'number',
      header: 'Số chương',
      render: (ch: Chapter) => `Chapter ${ch.number}`,
    },
    { key: 'title', header: 'Tiêu đề' },
    {
      key: 'pages',
      header: 'Số trang',
      render: (ch: Chapter) => ch.pages?.length ?? 0,
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (ch: Chapter) => new Date(ch.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (ch: Chapter) => (
        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(ch)}>
          Xoá
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/comics" className="text-sm text-blue-600 hover:underline">
            &larr; Quay lại danh sách truyện
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Chapters: {comicTitle}</h1>
        </div>
        <Link href={`/chapters/upload?comicId=${comicId}`}>
          <Button>Upload Chapter</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : chapters.length === 0 ? (
        <p className="text-gray-500">Chưa có chapter nào.</p>
      ) : (
        <Table columns={columns} data={chapters} keyExtractor={(ch) => ch._id} />
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xác nhận xoá">
        <p className="mb-4 text-sm text-gray-600">
          Bạn có chắc muốn xoá <strong>Chapter {deleteTarget?.number}</strong>?
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
