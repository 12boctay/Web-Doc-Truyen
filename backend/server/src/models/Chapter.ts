import mongoose, { Schema, Document } from 'mongoose';
import type { IChapter } from '@webdoctruyen/shared-be';

export interface ChapterDocument extends Omit<IChapter, '_id' | 'comicId'>, Document {
  comicId: mongoose.Types.ObjectId;
}

const chapterSchema = new Schema<ChapterDocument>({
  comicId: { type: Schema.Types.ObjectId, ref: 'Comic', required: true },
  number: { type: Number, required: true },
  title: { type: String, default: '' },
  slug: { type: String, required: true },
  pages: [
    {
      pageNumber: { type: Number, required: true },
      imageUrl: { type: String, required: true },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
  ],
  views: { type: Number, default: 0 },
  sourceUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

chapterSchema.pre('validate', function (next) {
  if (!this.slug && this.number != null) {
    this.slug = `chapter-${this.number}`;
  }
  next();
});

chapterSchema.index({ comicId: 1, number: -1 });
chapterSchema.index({ comicId: 1, slug: 1 });

export const Chapter = mongoose.model<ChapterDocument>('Chapter', chapterSchema);
