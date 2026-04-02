import { Category } from '../models/Category';
import { Comic } from '../models/Comic';
import { redis } from '../config/redis';

export async function listCategories() {
  const cacheKey = 'categories:all';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await Category.find().sort({ name: 1 }).lean();
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
  return data;
}

export async function createCategory(input: { name: string; description?: string }) {
  const existing = await Category.findOne({ name: input.name });
  if (existing) throw { status: 409, message: 'Category already exists' };

  const category = await Category.create(input);
  await redis.del('categories:all');
  return category;
}

export async function updateCategory(id: string, input: Record<string, unknown>) {
  const category = await Category.findByIdAndUpdate(id, input, { new: true });
  if (!category) throw { status: 404, message: 'Category not found' };
  await redis.del('categories:all');
  return category;
}

export async function deleteCategory(id: string) {
  const comicCount = await Comic.countDocuments({ categories: id });
  if (comicCount > 0) {
    throw { status: 400, message: 'Cannot delete category with associated comics' };
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw { status: 404, message: 'Category not found' };
  await redis.del('categories:all');
  return category;
}
