import { ChatRoom } from '../models/ChatRoom';
import mongoose from 'mongoose';

const GLOBAL_ROOM_NAME = 'Global Chat';

export async function seedGlobalRoom() {
  const existing = await ChatRoom.findOne({ type: 'global' });
  if (!existing) {
    await ChatRoom.create({ name: GLOBAL_ROOM_NAME, type: 'global', members: [], isActive: true });
    console.log('Global chat room created');
  }
}

export async function getGlobalRoom() {
  return ChatRoom.findOne({ type: 'global', isActive: true });
}

export async function createRoom(name: string, type: 'group' | 'direct', createdBy: string, memberIds?: string[]) {
  const members = memberIds
    ? memberIds.map((id) => new mongoose.Types.ObjectId(id))
    : [];

  if (!members.some((m) => m.toString() === createdBy)) {
    members.push(new mongoose.Types.ObjectId(createdBy));
  }

  return ChatRoom.create({
    name,
    type,
    members,
    createdBy: new mongoose.Types.ObjectId(createdBy),
    isActive: true,
  });
}

export async function getRoom(roomId: string) {
  return ChatRoom.findById(roomId);
}

export async function listUserRooms(userId: string) {
  return ChatRoom.find({
    isActive: true,
    $or: [
      { type: 'global' },
      { members: new mongoose.Types.ObjectId(userId) },
    ],
  }).sort({ updatedAt: -1 });
}

export async function listAllRooms() {
  return ChatRoom.aggregate([
    { $match: { isActive: true } },
    { $addFields: { memberCount: { $size: '$members' } } },
    { $sort: { updatedAt: -1 } },
  ]);
}

export async function joinRoom(roomId: string, userId: string) {
  return ChatRoom.findByIdAndUpdate(
    roomId,
    { $addToSet: { members: new mongoose.Types.ObjectId(userId) } },
    { new: true },
  );
}

export async function leaveRoom(roomId: string, userId: string) {
  const room = await ChatRoom.findById(roomId);
  if (!room) throw new Error('Room not found');
  if (room.type === 'global') throw new Error('Cannot leave global room');

  return ChatRoom.findByIdAndUpdate(
    roomId,
    { $pull: { members: new mongoose.Types.ObjectId(userId) } },
    { new: true },
  );
}

export async function getOrCreateDirectRoom(userId1: string, userId2: string) {
  const id1 = new mongoose.Types.ObjectId(userId1);
  const id2 = new mongoose.Types.ObjectId(userId2);

  // Check for existing direct room between these two users
  const existing = await ChatRoom.findOne({
    type: 'direct',
    isActive: true,
    members: { $all: [id1, id2], $size: 2 },
  });

  if (existing) return existing;

  return ChatRoom.create({
    name: 'Direct Message',
    type: 'direct',
    members: [id1, id2],
    isActive: true,
  });
}

export async function deleteRoom(roomId: string) {
  return ChatRoom.findByIdAndUpdate(roomId, { isActive: false }, { new: true });
}
