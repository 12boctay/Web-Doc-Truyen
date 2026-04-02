'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Table, Modal, Toast } from '@webdoctruyen/ui';

interface DonationGoal {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

const defaultForm = { title: '', description: '', targetAmount: '', startDate: '', endDate: '' };

export default function DonationGoalsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editGoal, setEditGoal] = useState<DonationGoal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DonationGoal | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'donation-goals'],
    queryFn: async () => {
      const { data } = await api.get('/donation-goals');
      return data;
    },
  });

  const goals: DonationGoal[] = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      await api.post('/donation-goals', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donation-goals'] });
      setShowCreate(false);
      setForm(defaultForm);
      setToast({ message: 'Tạo mục tiêu thành công', type: 'success' });
    },
    onError: () => setToast({ message: 'Tạo thất bại', type: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      await api.put(`/donation-goals/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donation-goals'] });
      setEditGoal(null);
      setToast({ message: 'Cập nhật thành công', type: 'success' });
    },
    onError: () => setToast({ message: 'Cập nhật thất bại', type: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/donation-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donation-goals'] });
      setDeleteTarget(null);
      setToast({ message: 'Xóa thành công', type: 'success' });
    },
    onError: () => setToast({ message: 'Xóa thất bại', type: 'error' }),
  });

  const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-');

  const columns = [
    { key: 'title', header: 'Mục tiêu' },
    {
      key: 'progress',
      header: 'Tiến độ',
      render: (g: DonationGoal) => {
        const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
        return (
          <div>
            <div className="mb-1 text-xs">
              {formatMoney(g.currentAmount)} / {formatMoney(g.targetAmount)}
            </div>
            <div className="h-2 w-32 rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'dates',
      header: 'Thời gian',
      render: (g: DonationGoal) => (
        <span className="text-xs">
          {formatDate(g.startDate)} - {formatDate(g.endDate)}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (g: DonationGoal) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${g.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {g.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (g: DonationGoal) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditGoal(g);
              setForm({
                title: g.title,
                description: g.description,
                targetAmount: String(g.targetAmount),
                startDate: g.startDate.split('T')[0],
                endDate: g.endDate.split('T')[0],
              });
            }}
          >
            Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateMutation.mutate({ id: g._id, body: { isActive: !g.isActive } })}
          >
            {g.isActive ? 'Tắt' : 'Bật'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(g)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const formFields = (
    <div className="space-y-4">
      <Input
        placeholder="Tiêu đề"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Input
        placeholder="Mô tả"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        placeholder="Số tiền mục tiêu (VND)"
        type="number"
        value={form.targetAmount}
        onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Bắt đầu</label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Kết thúc</label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mục tiêu Donation</h1>
        <Button
          onClick={() => {
            setForm(defaultForm);
            setShowCreate(true);
          }}
        >
          Tạo mới
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <Table columns={columns} data={goals} keyExtractor={(g) => g._id} />
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo mục tiêu donate">
        {formFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowCreate(false)}>
            Hủy
          </Button>
          <Button
            isLoading={createMutation.isPending}
            onClick={() =>
              createMutation.mutate({ ...form, targetAmount: Number(form.targetAmount) })
            }
          >
            Tạo
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editGoal} onClose={() => setEditGoal(null)} title="Sửa mục tiêu">
        {formFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditGoal(null)}>
            Hủy
          </Button>
          <Button
            isLoading={updateMutation.isPending}
            onClick={() =>
              editGoal &&
              updateMutation.mutate({
                id: editGoal._id,
                body: { ...form, targetAmount: Number(form.targetAmount) },
              })
            }
          >
            Lưu
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xác nhận xóa">
        <p className="mb-4 text-sm text-gray-600">
          Xóa mục tiêu <strong>{deleteTarget?.title}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
          >
            Xóa
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
