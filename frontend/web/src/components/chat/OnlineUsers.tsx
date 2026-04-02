'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface OnlineUsersProps {
  onStartDM?: (userId: string) => void;
}

export function OnlineUsers({ onStartDM }: OnlineUsersProps) {
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const otherUsers = onlineUsers.filter((id) => id !== currentUser?._id);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
        Online ({onlineUsers.length})
      </h3>
      {otherUsers.map((userId) => (
        <button
          key={userId}
          onClick={() => onStartDM?.(userId)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="truncate">User {userId.slice(-4)}</span>
        </button>
      ))}
      {otherUsers.length === 0 && (
        <p className="px-3 text-xs text-gray-400">Không có ai online</p>
      )}
    </div>
  );
}
