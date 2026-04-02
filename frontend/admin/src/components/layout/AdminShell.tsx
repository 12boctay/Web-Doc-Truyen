'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { AdminAuthGuard } from '../auth/AdminAuthGuard';

const NO_SHELL_PATHS = ['/dang-nhap'];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoShell = NO_SHELL_PATHS.includes(pathname);

  if (isNoShell) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="flex">
        <Sidebar />
        <main className="ml-60 flex-1 p-6">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
