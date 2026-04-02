import mongoose, { Schema, Document } from 'mongoose';
import type { IReadHistory } from '@webdoctruyen/shared-be';

export interface ReadHistoryDocument
  extends Omit<IReadHistory, '_id' | 'userId' | 'comicId' | 'chapterId'>, Document {
  userId: mongoose.Types.ObjectId;
  comicId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
}

const readHistorySchema = new Schema<ReadHistoryDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comicId: { type: Schema.Types.ObjectId, ref: 'Comic', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  chapterNumber: { type: Number, required: true },
  scrollPosition: { type: Number, default: 0 },
  lastReadAt: { type: Date, default: Date.now },
});

readHistorySchema.index({ userId: 1, lastReadAt: -1 });
readHistorySchema.index({ userId: 1, comicId: 1 }, { unique: true });

export const ReadHistory = mongoose.model<ReadHistoryDocument>('ReadHistory', readHistorySchema);
