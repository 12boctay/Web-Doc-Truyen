import type { Metadata } from 'next';
import { ReduxProvider } from '@/store/provider';
import { QueryProvider } from '@/lib/QueryProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'WebĐọcTruyện - Đọc truyện tranh online',
  description: 'Đọc truyện tranh manga, manhua, manhwa online miễn phí, cập nhật nhanh nhất',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-surface text-text antialiased" suppressHydrationWarning>
        <ReduxProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
