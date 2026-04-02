'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Toast } from '@webdoctruyen/ui';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Comic {
  _id: string;
  title: string;
  otherNames: string[];
  description: string;
  coverUrl: string;
  author: string;
  artist: string;
  country: string;
  status: string;
  categories: (string | Category)[];
}

const COUNTRIES = ['manga', 'manhwa', 'manhua', 'comic'];
const STATUSES = ['ongoing', 'completed', 'dropped'];

export default function EditComicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    title: '',
    otherNames: '',
    description: '',
    coverUrl: '',
    author: '',
    artist: '',
    country: 'manga',
    status: 'ongoing',
    categories: [] as string[],
  });

  const { data: comicData, isLoading: comicLoading } = useQuery<{ data: Comic }>({
    queryKey: ['comic', id],
    queryFn: async () => {
      const { data } = await api.get(`/comics/${id}`);
      return data;
    },
  });

  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const categories = categoriesData?.data ?? [];

  useEffect(() => {
    if (comicData?.data) {
      const comic = comicData.data;
      setForm({
        title: comic.title || '',
        otherNames: (comic.otherNames || []).join(', '),
        description: comic.description || '',
        coverUrl: comic.coverUrl || '',
        author: comic.author || '',
        artist: comic.artist || '',
        country: comic.country || 'manga',
        status: comic.status || 'ongoing',
        categories: (comic.categories || []).map((c) => (typeof c === 'string' ? c : c._id)),
      });
    }
  }, [comicData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const body = {
        ...form,
        otherNames: form.otherNames
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean),
      };
      await api.put(`/comics/${id}`, body);
    },
    onSuccess: () => {
      setToast({ message: 'Cập nhật truyện thành công', type: 'success' });
      setTimeout(() => router.push('/comics'), 1000);
    },
    onError: () => {
      setToast({ message: 'Cập nhật truyện thất bại', type: 'error' });
    },
  });

  const handleCategoryToggle = (catId: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (comicLoading) {
    return <p className="text-gray-500">Đang tải...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Chỉnh sửa truyện</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <Input
          label="Tiêu đề"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />

        <Input
          label="Tên khác (phân cách bởi dấu phẩy)"
          value={form.otherNames}
          onChange={(e) => setForm((f) => ({ ...f, otherNames: e.target.value }))}
          placeholder="Tên 1, Tên 2, Tên 3"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <Input
          label="Cover URL"
          value={form.coverUrl}
          onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
          placeholder="https://..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tác giả"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          />
          <Input
            label="Hoạ sĩ"
            value={form.artist}
            onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quốc gia</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Thể loại</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label
                key={cat._id}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                  form.categories.includes(cat._id)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.categories.includes(cat._id)}
                  onChange={() => handleCategoryToggle(cat._id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" isLoading={updateMutation.isPending}>
            Lưu thay đổi
          </Button>
          <Button variant="ghost" type="button" onClick={() => router.push('/comics')}>
            Huỷ
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
