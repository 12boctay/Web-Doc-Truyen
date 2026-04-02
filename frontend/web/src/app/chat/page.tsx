'use client';

import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setActiveRoom, setRooms } from '@/store/slices/chatSlice';
import { useSocket } from '@/hooks/useSocket';
import { useRooms, useCreateDirectRoom } from '@/hooks/useChat';
import { RoomList } from '@/components/chat/RoomList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { OnlineUsers } from '@/components/chat/OnlineUsers';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useEffect } from 'react';

export default function ChatPage() {
  useSocket();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const activeRoomId = useSelector((state: RootState) => state.chat.activeRoomId);
  const rooms = useSelector((state: RootState) => state.chat.rooms);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data: fetchedRooms } = useRooms();
  const createDM = useCreateDirectRoom();

  // Sync fetched rooms to Redux
  useEffect(() => {
    if (fetchedRooms) {
      dispatch(setRooms(fetchedRooms));
      // Auto-select first room if none selected
      if (!activeRoomId && fetchedRooms.length > 0) {
        dispatch(setActiveRoom(fetchedRooms[0]._id));
      }
    }
  }, [fetchedRooms, dispatch, activeRoomId]);

  const handleStartDM = useCallback(
    async (userId: string) => {
      const room = await createDM.mutateAsync(userId);
      dispatch(setActiveRoom(room._id));
    },
    [createDM, dispatch],
  );

  if (!isAuthenticated) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-gray-500">Vui lòng đăng nhập để sử dụng chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Sidebar — Room List */}
      <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 p-3">
        <RoomList rooms={rooms} />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {activeRoomId ? (
          <>
            {/* Room header */}
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-800">
                {rooms.find((r) => r._id === activeRoomId)?.name || 'Chat'}
              </h2>
            </div>

            <MessageList roomId={activeRoomId} onReply={(msgId) => setReplyTo(msgId)} />
            <TypingIndicator roomId={activeRoomId} />
            <MessageInput
              roomId={activeRoomId}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            Chọn phòng chat để bắt đầu
          </div>
        )}
      </div>

      {/* Right Panel — Online Users */}
      <div className="hidden w-56 flex-shrink-0 overflow-y-auto border-l border-gray-200 p-3 lg:block">
        <OnlineUsers onStartDM={handleStartDM} />
      </div>
    </div>
  );
}
