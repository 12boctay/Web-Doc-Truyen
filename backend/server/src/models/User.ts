import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import type { IUser } from '@webdoctruyen/shared-be';
import { slugify } from '@webdoctruyen/shared-be';

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: string[];
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['guest', 'user', 'moderator', 'admin', 'superadmin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'banned', 'suspended'],
      default: 'active',
    },
    bannedUntil: { type: Date, default: null },
    bannedReason: { type: String, default: '' },
    totalDonated: { type: Number, default: 0 },
    donorBadge: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold', 'diamond'],
      default: 'none',
    },
    lastLogin: { type: Date, default: null },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    refreshTokens: { type: [String], select: false, default: [] },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name) + '-' + Date.now().toString(36);
  }
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<UserDocument>('User', userSchema);
