'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Table, Modal, Toast } from '@webdoctruyen/ui';

interface Payment {
  _id: string;
  userId: any;
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  status: string;
  message: string;
  displayName: string;
  isAnonymous: boolean;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [completeTarget, setCompleteTarget] = useState<Payment | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/payments', { params });
      return data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'payment-stats'],
    queryFn: async () => {
      const { data } = await api.get('/payments/stats');
      return data.data;
    },
  });

  const payments: Payment[] = data?.data ?? [];

  const completeMutation = useMutation({
    mutationFn: async ({ id, transactionId }: { id: string; transactionId: string }) => {
      await api.put(`/payments/${id}/complete`, { transactionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-stats'] });
      setCompleteTarget(null);
      setTransactionId('');
      setToast({ message: 'Xác nhận thanh toán thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xác nhận thất bại', type: 'error' });
    },
  });

  const failMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/payments/${id}/fail`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      setToast({ message: 'Đã đánh dấu thất bại', type: 'success' });
    },
  });

  const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  const columns = [
    {
      key: 'user',
      header: 'Người donate',
      render: (p: Payment) => p.isAnonymous ? 'Ẩn danh' : (p.displayName || p.userId?.name || '-'),
    },
    {
      key: 'amount',
      header: 'Số tiền',
      render: (p: Payment) => <span className="font-medium">{formatMoney(p.amount)}</span>,
    },
    { key: 'method', header: 'PT Thanh toán' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p: Payment) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>
          {p.status}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Lời nhắn',
      render: (p: Payment) => <span className="text-xs text-gray-500 truncate max-w-[150px] block">{p.message || '-'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Ngày',
      render: (p: Payment) => new Date(p.createdAt).toLocaleString('vi-VN'),
    },
    {
      key: 'actions',
      header: '',
      render: (p: Payment) => p.status === 'pending' ? (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => setCompleteTarget(p)}>Xác nhận</Button>
          <Button variant="danger" size="sm" onClick={() => failMutation.mutate(p._id)}>Từ chối</Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý Donations</h1>

      {/* Stats */}
      {statsData && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Tổng donate</p>
            <p className="text-xl font-bold text-green-600">{formatMoney(statsData.totalAmount)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Tổng giao dịch</p>
            <p className="text-xl font-bold">{statsData.totalPayments}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Hôm nay</p>
            <p className="text-xl font-bold text-blue-600">{formatMoney(statsData.todayAmount)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {['', 'pending', 'completed', 'failed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'Tất cả'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <Table columns={columns} data={payments} keyExtractor={(p) => p._id} />
      )}

      {/* Complete Modal */}
      <Modal isOpen={!!completeTarget} onClose={() => setCompleteTarget(null)} title="Xác nhận thanh toán">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Xác nhận thanh toán <strong>{completeTarget && formatMoney(completeTarget.amount)}</strong> từ{' '}
            <strong>{completeTarget?.displayName || completeTarget?.userId?.name || 'User'}</strong>?
          </p>
          <input
            placeholder="Mã giao dịch (tùy chọn)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCompleteTarget(null)}>Hủy</Button>
            <Button
              isLoading={completeMutation.isPending}
              onClick={() => completeTarget && completeMutation.mutate({ id: completeTarget._id, transactionId })}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
