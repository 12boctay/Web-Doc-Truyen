import mongoose, { Schema, Document } from 'mongoose';
import type { IComment } from '@webdoctruyen/shared-be';

export interface CommentDocument
  extends Omit<IComment, '_id' | 'userId' | 'comicId' | 'chapterId' | 'parentId' | 'likes'>,
    Document {
  userId: mongoose.Types.ObjectId;
  comicId: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
}

const commentSchema = new Schema<CommentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comicId: { type: Schema.Types.ObjectId, ref: 'Comic', required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter' },
    content: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['visible', 'hidden', 'deleted'], default: 'visible' },
  },
  { timestamps: true },
);

commentSchema.index({ comicId: 1, createdAt: -1 });
commentSchema.index({ chapterId: 1 });

export const Comment = mongoose.model<CommentDocument>('Comment', commentSchema);
