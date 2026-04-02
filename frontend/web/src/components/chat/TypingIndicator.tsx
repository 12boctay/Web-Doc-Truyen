'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function TypingIndicator({ roomId }: { roomId: string }) {
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers[roomId] || []);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const others = typingUsers.filter((t) => t.userId !== currentUser?._id);
  if (others.length === 0) return null;

  const names = others.map((t) => t.userName || `User ${t.userId.slice(-4)}`);
  const text =
    names.length === 1 ? `${names[0]} đang nhập...` : `${names.length} người đang nhập...`;

  return (
    <div className="px-4 py-1">
      <p className="text-xs italic text-gray-400">{text}</p>
    </div>
  );
}
