'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Table, Modal, Toast } from '@webdoctruyen/ui';

interface Comment {
  _id: string;
  userId: string | { _id: string; username: string };
  content: string;
  isHidden?: boolean;
  createdAt: string;
}

export default function CommentsPage() {
  const queryClient = useQueryClient();
  const [comicId, setComicId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading, isFetching } = useQuery<{ data: Comment[] }>({
    queryKey: ['comments', searchId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/comic/${searchId}`);
      return data;
    },
    enabled: !!searchId,
  });

  const comments = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', searchId] });
      setDeleteTarget(null);
      setToast({ message: 'Xoá comment thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xoá comment thất bại', type: 'error' });
    },
  });

  const hideMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/comments/${id}/hide`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', searchId] });
      setToast({ message: 'Đã ẩn comment', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Ẩn comment thất bại', type: 'error' });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (comicId.trim()) {
      setSearchId(comicId.trim());
    }
  };

  const getUsername = (userId: Comment['userId']) => {
    if (typeof userId === 'object' && userId !== null) return userId.username;
    return String(userId);
  };

  const columns = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (c: Comment) => <span className="font-medium">{getUsername(c.userId)}</span>,
    },
    {
      key: 'content',
      header: 'Nội dung',
      render: (c: Comment) => (
        <span className={`${c.isHidden ? 'italic text-gray-400 line-through' : ''}`}>
          {c.content.length > 100 ? c.content.substring(0, 100) + '...' : c.content}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (c: Comment) => new Date(c.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (c: Comment) =>
        c.isHidden ? (
          <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            Đã ẩn
          </span>
        ) : (
          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            Hiển thị
          </span>
        ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (c: Comment) => (
        <div className="flex gap-2">
          {!c.isHidden && (
            <Button
              variant="outline"
              size="sm"
              isLoading={hideMutation.isPending}
              onClick={() => hideMutation.mutate(c._id)}
            >
              Ẩn
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(c)}>
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý bình luận</h1>

      <form onSubmit={handleSearch} className="mb-6 flex max-w-md gap-2">
        <Input
          placeholder="Nhập Comic ID để tải bình luận..."
          value={comicId}
          onChange={(e) => setComicId(e.target.value)}
        />
        <Button type="submit" isLoading={isFetching}>
          Tải
        </Button>
      </form>

      <p className="mb-4 text-sm text-gray-500">
        Nhập ID của truyện để xem và quản lý bình luận. Trang này sẽ được nâng cấp với endpoint
        riêng để liệt kê tất cả bình luận gần đây.
      </p>

      {searchId && isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : searchId && comments.length === 0 ? (
        <p className="text-gray-500">Không có bình luận nào.</p>
      ) : searchId ? (
        <Table columns={columns} data={comments} keyExtractor={(c) => c._id} />
      ) : null}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xác nhận xoá">
        <p className="mb-4 text-sm text-gray-600">Bạn có chắc muốn xoá bình luận này?</p>
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
