'use client';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setActiveRoom } from '@/store/slices/chatSlice';
import type { IChatRoom } from '@webdoctruyen/shared-fe';

export function RoomList({ rooms }: { rooms: IChatRoom[] }) {
  const dispatch = useDispatch();
  const activeRoomId = useSelector((state: RootState) => state.chat.activeRoomId);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">Phòng chat</h3>
      {rooms.map((room) => (
        <button
          key={room._id}
          onClick={() => dispatch(setActiveRoom(room._id))}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            activeRoomId === room._id
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg">
            {room.type === 'global' ? '🌐' : room.type === 'direct' ? '💬' : '👥'}
          </span>
          <span className="truncate font-medium">{room.name}</span>
          {room.type !== 'global' && (
            <span className="ml-auto text-xs text-gray-400">{room.members?.length || 0}</span>
          )}
        </button>
      ))}
      {rooms.length === 0 && <p className="px-3 text-sm text-gray-400">Chưa có phòng chat nào</p>}
    </div>
  );
}
