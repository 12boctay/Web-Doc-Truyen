'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import type { RootState } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === 'admin' || role === 'superadmin' || role === 'moderator') {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, router]);

  const loginMutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', input);
      return data.data as { accessToken: string; user: any };
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      const data = await loginMutation.mutateAsync({ email, password });
      const role = data.user.role;

      if (role !== 'admin' && role !== 'superadmin' && role !== 'moderator') {
        setError('Tài khoản không có quyền truy cập trang quản trị');
        return;
      }

      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-500">WebĐọcTruyện - Đăng nhập quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
