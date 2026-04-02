'use client';

import { useState, useRef, useCallback } from 'react';
import { getChatSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@webdoctruyen/shared-fe';

interface MessageInputProps {
  roomId: string;
  replyTo?: string | null;
  onCancelReply?: () => void;
}

export function MessageInput({ roomId, replyTo, onCancelReply }: MessageInputProps) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = useCallback(() => {
    if (!text.trim() || !roomId) return;

    const socket = getChatSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.CHAT_SEND, {
        roomId,
        content: text.trim(),
        replyTo: replyTo || undefined,
      });
    }

    setText('');
    onCancelReply?.();
  }, [text, roomId, replyTo, onCancelReply]);

  const handleTyping = () => {
    const socket = getChatSocket();
    if (!socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit(SOCKET_EVENTS.CHAT_TYPING, { roomId });

    typingTimeoutRef.current = setTimeout(() => {
      // Typing indicator auto-clears after timeout
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-3">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded bg-blue-50 px-3 py-1.5">
          <span className="text-xs text-blue-600">Đang trả lời tin nhắn</span>
          <button onClick={onCancelReply} className="text-xs text-gray-400 hover:text-gray-600">
            Hủy
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
