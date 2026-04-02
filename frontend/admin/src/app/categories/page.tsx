'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Table, Modal, Toast } from '@webdoctruyen/ui';

interface Category {
  _id: string;
  name: string;
  slug: string;
  comicCount?: number;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading } = useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const categories = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post('/categories', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setToast({ message: 'Thêm thể loại thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Thêm thể loại thất bại', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/categories/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      setToast({ message: 'Cập nhật thể loại thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Cập nhật thể loại thất bại', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
      setToast({ message: 'Xoá thể loại thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xoá thể loại thất bại', type: 'error' });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createMutation.mutate(newName.trim());
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      updateMutation.mutate({ id: editingId, name: editingName.trim() });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Tên',
      render: (cat: Category) =>
        editingId === cat._id ? (
          <input
            className="rounded border border-blue-400 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') setEditingId(null);
            }}
            autoFocus
          />
        ) : (
          cat.name
        ),
    },
    { key: 'slug', header: 'Slug' },
    {
      key: 'comicCount',
      header: 'Số truyện',
      render: (cat: Category) => cat.comicCount ?? 0,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (cat: Category) =>
        editingId === cat._id ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} isLoading={updateMutation.isPending}>
              Lưu
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
              Huỷ
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => startEdit(cat)}>
              Sửa
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteTarget(cat)}>
              Xoá
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý thể loại</h1>

      <form onSubmit={handleAdd} className="mb-6 flex max-w-md gap-2">
        <Input
          placeholder="Tên thể loại mới..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" isLoading={createMutation.isPending}>
          Thêm
        </Button>
      </form>

      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <Table columns={columns} data={categories} keyExtractor={(c) => c._id} />
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xác nhận xoá">
        <p className="mb-4 text-sm text-gray-600">
          Bạn có chắc muốn xoá thể loại <strong>{deleteTarget?.name}</strong>?
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
