import mongoose, { Schema, Document } from 'mongoose';
import type { IComic } from '@webdoctruyen/shared-be';
import { slugify } from '@webdoctruyen/shared-be';

export interface ComicDocument extends Omit<IComic, '_id' | 'categories'>, Document {
  categories: mongoose.Types.ObjectId[];
}

const comicSchema = new Schema<ComicDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    otherNames: [{ type: String }],
    description: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    author: { type: String, default: '' },
    artist: { type: String, default: '' },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    country: { type: String, enum: ['manga', 'manhua', 'manhwa', 'comic'], required: true },
    status: { type: String, enum: ['ongoing', 'completed', 'dropped'], default: 'ongoing' },
    totalChapters: { type: Number, default: 0 },
    latestChapter: {
      number: { type: Number, default: 0 },
      title: { type: String, default: '' },
      updatedAt: { type: Date, default: null },
    },
    views: {
      total: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    followers: { type: Number, default: 0 },
    sourceUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

comicSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

comicSchema.index({ slug: 1 });
comicSchema.index({ categories: 1 });
comicSchema.index({ country: 1 });
comicSchema.index({ 'views.daily': -1 });
comicSchema.index({ 'views.weekly': -1 });
comicSchema.index({ updatedAt: -1 });
comicSchema.index({ title: 'text', otherNames: 'text' });

export const Comic = mongoose.model<ComicDocument>('Comic', comicSchema);
