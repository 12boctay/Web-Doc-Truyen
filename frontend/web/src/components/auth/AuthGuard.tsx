'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { UserRole } from '@webdoctruyen/shared-fe';
import { hasRole } from '@webdoctruyen/shared-fe';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole = 'user',
  fallback,
  redirectTo = '/dang-nhap',
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requiredRole && user && !hasRole(user.role as UserRole, requiredRole)) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-red-600">Không có quyền truy cập</p>
        <p className="mt-2 text-sm text-gray-500">
          Bạn cần quyền <span className="font-medium">{requiredRole}</span> để xem trang này.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
