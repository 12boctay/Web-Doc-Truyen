import mongoose, { Schema, Document } from 'mongoose';
import type { IRating } from '@webdoctruyen/shared-be';

export interface RatingDocument extends Omit<IRating, '_id' | 'userId' | 'comicId'>, Document {
  userId: mongoose.Types.ObjectId;
  comicId: mongoose.Types.ObjectId;
}

const ratingSchema = new Schema<RatingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comicId: { type: Schema.Types.ObjectId, ref: 'Comic', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

ratingSchema.index({ userId: 1, comicId: 1 }, { unique: true });

export const Rating = mongoose.model<RatingDocument>('Rating', ratingSchema);
