import mongoose, { Schema, Document } from 'mongoose';
import type { ICategory } from '@webdoctruyen/shared-be';
import { slugify } from '@webdoctruyen/shared-be';

export interface CategoryDocument extends Omit<ICategory, '_id'>, Document {}

const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  comicCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);
