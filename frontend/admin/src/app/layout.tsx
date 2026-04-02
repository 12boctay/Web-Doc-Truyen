import type { Metadata } from 'next';
import { ReduxProvider } from '@/store/provider';
import { QueryProvider } from '@/lib/QueryProvider';
import { AdminShell } from '@/components/layout/AdminShell';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'WebĐọcTruyện - Admin',
  description: 'Admin panel for WebĐọcTruyện',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <ReduxProvider>
          <QueryProvider>
            <AdminShell>{children}</AdminShell>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
