'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button, Input, Table, Modal, Toast } from '@webdoctruyen/ui';

interface ChatRoom {
  _id: string;
  name: string;
  type: string;
  members: string[];
  memberCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminChatPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatRoom | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [roomName, setRoomName] = useState('');

  const { data, isLoading } = useQuery<{ data: ChatRoom[] }>({
    queryKey: ['admin', 'chat-rooms'],
    queryFn: async () => {
      const { data } = await api.get('/chat/rooms/all');
      return data;
    },
  });

  const rooms = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post('/chat/rooms', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chat-rooms'] });
      setShowCreate(false);
      setRoomName('');
      setToast({ message: 'Tạo phòng chat thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Tạo phòng chat thất bại', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/chat/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'chat-rooms'] });
      setDeleteTarget(null);
      setToast({ message: 'Xóa phòng chat thành công', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Xóa phòng chat thất bại', type: 'error' });
    },
  });

  const columns = [
    { key: 'name', header: 'Tên phòng' },
    {
      key: 'type',
      header: 'Loại',
      render: (r: ChatRoom) => (
        <span className={`rounded-full px-2 py-0.5 text-xs ${
          r.type === 'global' ? 'bg-blue-100 text-blue-700' :
          r.type === 'direct' ? 'bg-purple-100 text-purple-700' :
          'bg-green-100 text-green-700'
        }`}>
          {r.type}
        </span>
      ),
    },
    {
      key: 'memberCount',
      header: 'Thành viên',
      render: (r: ChatRoom) => r.memberCount ?? r.members?.length ?? 0,
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (r: ChatRoom) => (
        <span className={`text-xs ${r.isActive ? 'text-green-600' : 'text-gray-400'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      render: (r: ChatRoom) => new Date(r.updatedAt).toLocaleString('vi-VN'),
    },
    {
      key: 'actions',
      header: '',
      render: (r: ChatRoom) => r.type !== 'global' ? (
        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(r)}>
          Xóa
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Chat</h1>
        <Button onClick={() => setShowCreate(true)}>Tạo phòng mới</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <Table columns={columns} data={rooms} keyExtractor={(r) => r._id} />
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo phòng chat">
        <div className="space-y-4">
          <Input
            placeholder="Tên phòng chat"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button
              isLoading={createMutation.isPending}
              onClick={() => roomName && createMutation.mutate(roomName)}
            >
              Tạo
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xác nhận xóa">
        <p className="mb-4 text-sm text-gray-600">
          Xóa phòng chat <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Hủy</Button>
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
