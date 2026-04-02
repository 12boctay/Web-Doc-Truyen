'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Table, Modal, Toast } from '@webdoctruyen/ui';

interface CrawlSource {
  _id: string;
  name: string;
  baseUrl: string;
  schedule: string;
  isActive: boolean;
  lastCrawlAt: string | null;
  lastError: string;
  stats: {
    totalCrawled: number;
    totalErrors: number;
    lastSuccessAt: string | null;
  };
  createdAt: string;
}

export default function CrawlSourcesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editSource, setEditSource] = useState<CrawlSource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrawlSource | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({ name: '', baseUrl: '', schedule: '*/30 * * * *' });

  const { data, isLoading } = useQuery<{ data: CrawlSource[] }>({
    queryKey: ['crawl-sources'],
    queryFn: async () => {
      const { data } = await api.get('/crawl-sources');
      return data;
    },
  });

  const sources = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: async (body: typeof form) => {
      await api.post('/crawl-sources', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawl-sources'] });
      setShowCreate(false);
      setForm({ name: '', baseUrl: '', schedule: '*/30 * * * *' });
      setToast({ message: 'Tạo crawl source thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Tạo crawl source thất bại', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<CrawlSource> }) => {
      await api.put(`/crawl-sources/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawl-sources'] });
      setEditSource(null);
      setToast({ message: 'Cập nhật thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Cập nhật thất bại', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/crawl-sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawl-sources'] });
      setDeleteTarget(null);
      setToast({ message: 'Xoá thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xoá thất bại', type: 'error' });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/crawl-sources/${id}/test`);
      return data;
    },
    onSuccess: (data) => {
      const result = data.data;
      setToast({
        message: result.reachable
          ? `Reachable (${result.status})`
          : `Unreachable: ${result.error || result.status}`,
        type: result.reachable ? 'success' : 'error',
      });
    },
    onError: () => {
      setToast({ message: 'Test failed', type: 'error' });
    },
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'baseUrl', header: 'URL' },
    { key: 'schedule', header: 'Schedule' },
    {
      key: 'isActive',
      header: 'Active',
      render: (s: CrawlSource) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {s.isActive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (s: CrawlSource) => (
        <span className="text-xs text-gray-500">
          {s.stats.totalCrawled} crawled / {s.stats.totalErrors} errors
        </span>
      ),
    },
    {
      key: 'lastCrawlAt',
      header: 'Last Crawl',
      render: (s: CrawlSource) => (s.lastCrawlAt ? new Date(s.lastCrawlAt).toLocaleString() : '-'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: CrawlSource) => (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => testMutation.mutate(s._id)}>
            Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditSource(s);
              setForm({ name: s.name, baseUrl: s.baseUrl, schedule: s.schedule });
            }}
          >
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(s)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crawl Sources</h1>
        <Button onClick={() => setShowCreate(true)}>Add Source</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <Table columns={columns} data={sources} keyExtractor={(s) => s._id} />
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Crawl Source">
        <div className="space-y-4">
          <Input
            placeholder="Name (e.g. TruyenQQ)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Base URL"
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
          />
          <Input
            placeholder="Schedule (cron)"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editSource} onClose={() => setEditSource(null)} title="Edit Crawl Source">
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Base URL"
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
          />
          <Input
            placeholder="Schedule (cron)"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditSource(null)}>
              Cancel
            </Button>
            <Button
              isLoading={updateMutation.isPending}
              onClick={() =>
                editSource && updateMutation.mutate({ id: editSource._id, body: form })
              }
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
        <p className="mb-4 text-sm text-gray-600">
          Delete <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
