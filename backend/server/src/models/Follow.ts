import mongoose, { Schema, Document } from 'mongoose';
import type { IFollow } from '@webdoctruyen/shared-be';

export interface FollowDocument extends Omit<IFollow, '_id' | 'userId' | 'comicId'>, Document {
  userId: mongoose.Types.ObjectId;
  comicId: mongoose.Types.ObjectId;
}

const followSchema = new Schema<FollowDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comicId: { type: Schema.Types.ObjectId, ref: 'Comic', required: true },
  lastReadChapter: { type: Number, default: 0 },
  notifyEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

followSchema.index({ userId: 1, comicId: 1 }, { unique: true });

export const Follow = mongoose.model<FollowDocument>('Follow', followSchema);
