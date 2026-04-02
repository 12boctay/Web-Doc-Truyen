import Link from 'next/link';
import { BookOpen, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading text-lg text-primary">
              <BookOpen className="h-5 w-5 text-accent" />
              WebĐọcTruyện
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Đọc truyện tranh manga, manhua, manhwa online miễn phí. Cập nhật nhanh nhất.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">Truyện</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/truyen" className="transition-colors duration-200 hover:text-accent">
                  Tất cả truyện
                </Link>
              </li>
              <li>
                <Link href="/xep-hang" className="transition-colors duration-200 hover:text-accent">
                  Xếp hạng
                </Link>
              </li>
              <li>
                <Link href="/the-loai" className="transition-colors duration-200 hover:text-accent">
                  Thể loại
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">Cộng đồng</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/chat" className="transition-colors duration-200 hover:text-accent">
                  Chat
                </Link>
              </li>
              <li>
                <Link href="/donate" className="transition-colors duration-200 hover:text-accent">
                  Ủng hộ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-text">Tài khoản</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link
                  href="/dang-nhap"
                  className="transition-colors duration-200 hover:text-accent"
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link href="/dang-ky" className="transition-colors duration-200 hover:text-accent">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs text-text-faint">
            &copy; {new Date().getFullYear()} WebĐọcTruyện. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-text-faint">
            Made with <Heart className="h-3 w-3 text-red-400" /> in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
