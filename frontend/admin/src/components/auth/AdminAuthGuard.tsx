'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const PUBLIC_PATHS = ['/dang-nhap'];

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/dang-nhap');
    }
  }, [isAuthenticated, isPublicPath, router]);

  // On public paths, render children (login page)
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Not authenticated — show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Check role — must be admin or superadmin
  const role = user?.role || '';
  if (role !== 'admin' && role !== 'superadmin' && role !== 'moderator') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Truy cập bị từ chối</p>
          <p className="mt-2 text-sm text-gray-500">
            Bạn cần quyền Admin hoặc Moderator để truy cập trang quản trị.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Vai trò hiện tại: <span className="font-medium">{role || 'guest'}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
