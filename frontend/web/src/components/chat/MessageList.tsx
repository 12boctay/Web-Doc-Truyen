'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { MessageBubble } from './MessageBubble';
import { getChatSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@webdoctruyen/shared-fe';

interface MessageListProps {
  roomId: string;
  onReply?: (messageId: string) => void;
}

export function MessageList({ roomId, onReply }: MessageListProps) {
  const messages = useSelector((state: RootState) => state.chat.messages[roomId] || []);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Load initial history
  useEffect(() => {
    const socket = getChatSocket();
    if (socket && roomId) {
      socket.emit(SOCKET_EVENTS.CHAT_HISTORY, { roomId });
    }
  }, [roomId]);

  const handleLoadMore = () => {
    const socket = getChatSocket();
    if (socket && messages.length > 0) {
      socket.emit(SOCKET_EVENTS.CHAT_HISTORY, {
        roomId,
        before: messages[0]._id,
      });
    }
  };

  const handleDelete = (messageId: string) => {
    const socket = getChatSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.CHAT_DELETE, { messageId, roomId });
    }
  };

  return (
    <div ref={containerRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.length >= 50 && (
        <button onClick={handleLoadMore} className="mx-auto text-xs text-blue-500 hover:underline">
          Tải thêm tin nhắn cũ
        </button>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} onDelete={handleDelete} onReply={onReply} />
      ))}
      {messages.length === 0 && (
        <p className="m-auto text-sm text-gray-400">Chưa có tin nhắn nào</p>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
