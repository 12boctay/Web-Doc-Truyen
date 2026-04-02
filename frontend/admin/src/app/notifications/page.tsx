'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Toast } from '@webdoctruyen/ui';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const announceMutation = useMutation({
    mutationFn: async (body: { title: string; message: string }) => {
      const { data } = await api.post('/notifications/announce', body);
      return data;
    },
    onSuccess: (data) => {
      setTitle('');
      setMessage('');
      setToast({ message: data.message || 'Gửi thông báo thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Gửi thông báo thất bại', type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    announceMutation.mutate({ title: title.trim(), message: message.trim() });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Gửi thông báo</h1>

      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tiêu đề
            </label>
            <Input
              placeholder="Tiêu đề thông báo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nội dung
            </label>
            <textarea
              placeholder="Nội dung thông báo..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            isLoading={announceMutation.isPending}
            disabled={!title.trim() || !message.trim()}
          >
            Gửi thông báo cho tất cả user
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          Thông báo sẽ được gửi tới tất cả user đang hoạt động. User online sẽ nhận ngay lập tức.
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
