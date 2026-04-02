'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Toast } from '@webdoctruyen/ui';

interface Comic {
  _id: string;
  title: string;
  slug: string;
}

export default function UploadChapterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedComicId = searchParams.get('comicId') || '';

  const [comicId, setComicId] = useState(preselectedComicId);
  const [chapterNumber, setChapterNumber] = useState('');
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: comicsData } = useQuery<{ data: Comic[] }>({
    queryKey: ['comics-all'],
    queryFn: async () => {
      const { data } = await api.get('/comics', { params: { limit: 200 } });
      return data;
    },
  });

  const comics = comicsData?.data ?? [];

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!files || files.length === 0) throw new Error('No files selected');
      setUploading(true);

      // Step 1: Upload images
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      const uploadRes = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrls: string[] = uploadRes.data.data?.urls || uploadRes.data.urls || [];

      // Step 2: Create chapter
      const chapterBody = {
        comicId,
        number: Number(chapterNumber),
        title: title || `Chapter ${chapterNumber}`,
        slug: `chapter-${chapterNumber}`,
        pages: imageUrls.map((url: string, index: number) => ({
          pageNumber: index + 1,
          url,
        })),
      };

      await api.post('/chapters', chapterBody);
    },
    onSuccess: () => {
      setUploading(false);
      setToast({ message: 'Upload chapter thành công', type: 'success' });
      setTimeout(() => {
        if (comicId) {
          router.push(`/chapters/${comicId}`);
        } else {
          router.push('/comics');
        }
      }, 1000);
    },
    onError: () => {
      setUploading(false);
      setToast({ message: 'Upload chapter thất bại', type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comicId) {
      setToast({ message: 'Vui lòng chọn truyện', type: 'error' });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Upload Chapter</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Chọn truyện</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={comicId}
            onChange={(e) => setComicId(e.target.value)}
            required
          >
            <option value="">-- Chọn truyện --</option>
            {comics.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Số chương"
          type="number"
          value={chapterNumber}
          onChange={(e) => setChapterNumber(e.target.value)}
          required
          min="1"
        />

        <Input
          label="Tiêu đề (tuỳ chọn)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Khởi đầu mới"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ảnh các trang (chọn nhiều file)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          {files && files.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">Đã chọn {files.length} ảnh</p>
          )}
        </div>

        {uploading && (
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            Đang upload... Vui lòng không đóng trang.
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" isLoading={uploadMutation.isPending}>
            Upload
          </Button>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Huỷ
          </Button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
