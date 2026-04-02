'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { api } from '@/lib/api';

const menuItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Truyện', href: '/comics' },
  { label: 'Thể loại', href: '/categories' },
  { label: 'Users', href: '/users' },
  { label: 'Comments', href: '/comments' },
  { label: 'Chat', href: '/chat' },
  { label: 'Thông báo', href: '/notifications' },
  { label: 'Payments', href: '/payments' },
  { label: 'Mục tiêu Donate', href: '/donation-goals' },
  { label: 'Crawl Sources', href: '/crawl-sources' },
  { label: 'n8n', href: '/n8n' },
  { label: 'Settings', href: '/settings' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  admin: { label: 'Admin', color: 'bg-orange-100 text-orange-700' },
  moderator: { label: 'Moderator', color: 'bg-purple-100 text-purple-700' },
};

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const roleBadge = user?.role ? ROLE_LABELS[user.role] : null;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    dispatch(logout());
    router.push('/dang-nhap');
  };

  return (
    <aside className="fixed left-0 top-0 flex h-full w-60 flex-col border-r border-gray-200 bg-gray-50">
      <div className="p-4">
        <div className="text-lg font-bold text-blue-600">Admin Panel</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout at bottom */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            {roleBadge && (
              <span
                className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${roleBadge.color}`}
              >
                {roleBadge.label}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  );
}
