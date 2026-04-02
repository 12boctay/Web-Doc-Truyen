'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface MessageBubbleProps {
  message: any;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

export function MessageBubble({ message, onDelete, onReply }: MessageBubbleProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isOwn = currentUser?._id === (message.userId?._id || message.userId);
  const userName = message.user?.name || message.userId?.name || 'Unknown';
  const time = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`group flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium text-gray-500">{userName}</p>
        )}
        {message.replyTo && (
          <div className="mb-1 rounded border-l-2 border-blue-300 bg-gray-50 px-2 py-1 text-xs text-gray-500">
            {typeof message.replyTo === 'object' ? message.replyTo.content : 'Trả lời tin nhắn'}
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{time}</span>
          <div className="hidden gap-1 group-hover:flex">
            {onReply && (
              <button
                onClick={() => onReply(message._id)}
                className="text-[10px] text-gray-400 hover:text-blue-500"
              >
                Trả lời
              </button>
            )}
            {(isOwn || currentUser?.role === 'admin' || currentUser?.role === 'moderator') && onDelete && (
              <button
                onClick={() => onDelete(message._id)}
                className="text-[10px] text-gray-400 hover:text-red-500"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
