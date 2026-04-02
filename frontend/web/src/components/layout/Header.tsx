'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { NotificationBell } from '@/components/notification/NotificationBell';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Search, Heart, LogOut, Shield, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { href: '/truyen', label: 'Truyện' },
  { href: '/the-loai', label: 'Thể loại' },
  { href: '/xep-hang', label: 'Xếp hạng' },
  { href: '/donate', label: 'Ủng hộ' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'Super Admin', color: 'bg-red-500/10 text-red-400' },
  admin: { label: 'Admin', color: 'bg-accent/10 text-accent' },
  moderator: { label: 'Mod', color: 'bg-purple-500/10 text-purple-400' },
  user: { label: 'User', color: 'bg-secondary/10 text-text-muted' },
};

export function Header() {
  useSocket();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleBadge = user?.role ? ROLE_LABELS[user.role] || ROLE_LABELS.user : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-heading text-xl tracking-tight text-primary transition-colors hover:text-accent"
          >
            WebĐọcTruyện
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/chat"
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
              >
                Chat
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/tim-kiem"
            className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isAuthenticated && user ? (
            <>
              <NotificationBell />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-surface-alt"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-text-faint md:block" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface shadow-lg">
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold text-text">{user.name}</p>
                        <p className="text-xs text-text-faint">{user.email}</p>
                        {roleBadge && (
                          <span
                            className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${roleBadge.color}`}
                          >
                            {roleBadge.label}
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <a
                            href="http://localhost:3001"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
                          >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            logout.mutate();
                          }}
                          className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-sm text-red-500 transition-colors duration-200 hover:bg-red-500/5"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/dang-nhap"
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
              >
                Đăng nhập
              </Link>
              <Link
                href="/dang-ky"
                className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-surface-alt md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/chat"
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
              >
                Chat
              </Link>
            )}
            {!isAuthenticated && (
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                <Link
                  href="/dang-nhap"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-border py-2.5 text-center text-sm font-medium text-text transition-colors duration-200 hover:bg-surface-alt"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 cursor-pointer rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
