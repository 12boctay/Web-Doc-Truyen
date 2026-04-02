'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { NotificationDropdown } from './NotificationDropdown';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer rounded-lg p-2 text-text-muted transition-colors duration-200 hover:bg-surface-alt hover:text-text"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}
