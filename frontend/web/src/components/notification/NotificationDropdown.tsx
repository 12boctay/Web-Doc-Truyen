'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/store';
import { markNotificationRead, markAllNotificationsRead } from '@/store/slices/notificationSlice';
import { useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import type { INotification } from '@webdoctruyen/shared-fe';
import { BookOpen, MessageCircle, Megaphone, Mail, BellRing, CheckCheck } from 'lucide-react';

const NOTIF_ICONS: Record<string, typeof BookOpen> = {
  new_chapter: BookOpen,
  reply_comment: MessageCircle,
  announcement: Megaphone,
  chat_message: Mail,
};

function getNotificationLink(notif: INotification): string | null {
  if (notif.data?.comicId && notif.data?.chapterId) return `/truyen/${notif.data.comicId}`;
  if (notif.data?.chatRoomId) return '/chat';
  return null;
}

function timeAgo(date: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const markReadMutation = useMarkRead();
  const markAllMutation = useMarkAllRead();

  const handleClick = (notif: INotification) => {
    if (!notif.read) {
      dispatch(markNotificationRead(notif._id));
      markReadMutation.mutate(notif._id);
    }
    const link = getNotificationLink(notif);
    if (link) {
      router.push(link);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
    markAllMutation.mutate();
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-surface shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text">Thông báo</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-accent transition-colors duration-200 hover:text-accent-hover"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Đọc tất cả
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <BellRing className="h-8 w-8 text-text-faint" />
            <p className="text-sm text-text-faint">Không có thông báo</p>
          </div>
        ) : (
          notifications.slice(0, 20).map((notif) => {
            const Icon = NOTIF_ICONS[notif.type] || BellRing;
            return (
              <button
                key={notif._id}
                onClick={() => handleClick(notif)}
                className={`flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-alt ${
                  !notif.read ? 'bg-accent/5' : ''
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${!notif.read ? 'bg-accent/10 text-accent' : 'bg-surface-alt text-text-faint'}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${!notif.read ? 'font-medium text-text' : 'text-text-muted'}`}
                  >
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="mt-0.5 truncate text-xs text-text-faint">{notif.message}</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-faint">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
