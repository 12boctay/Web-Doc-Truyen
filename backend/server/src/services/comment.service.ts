import { Comment } from '../models/Comment';
import * as notificationService from './notification.service';
import { emitNotificationToUser } from '../socket/notification.handler';

interface CreateCommentInput {
  comicId: string;
  chapterId?: string;
  content: string;
  parentId?: string;
}

export async function createComment(userId: string, input: CreateCommentInput) {
  const comment = await Comment.create({
    userId,
    comicId: input.comicId,
    chapterId: input.chapterId,
    content: input.content,
    parentId: input.parentId,
    status: 'visible',
  });

  // Notify parent comment author if this is a reply
  if (input.parentId) {
    const parentComment = await Comment.findById(input.parentId).lean();
    if (parentComment && parentComment.userId.toString() !== userId) {
      const notif = await notificationService.create({
        userId: parentComment.userId.toString(),
        type: 'reply_comment',
        title: 'Có người trả lời bình luận của bạn',
        message: input.content.substring(0, 100),
        data: {
          comicId: input.comicId,
          chapterId: input.chapterId,
          commentId: comment._id.toString(),
        },
      });
      emitNotificationToUser(parentComment.userId.toString(), notif);
    }
  }

  return comment;
}

export async function listComments(comicId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Comment.find({ comicId, status: 'visible' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar')
      .lean(),
    Comment.countDocuments({ comicId, status: 'visible' }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listChapterComments(chapterId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Comment.find({ chapterId, status: 'visible' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar')
      .lean(),
    Comment.countDocuments({ chapterId, status: 'visible' }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateComment(userId: string, commentId: string, content: string) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw { status: 404, message: 'Comment not found' };
  if (comment.userId.toString() !== userId) {
    throw { status: 403, message: 'Not authorized to edit this comment' };
  }
  comment.content = content;
  await comment.save();
  return comment;
}

export async function likeComment(userId: string, commentId: string) {
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $addToSet: { likes: userId } },
    { new: true },
  );
  if (!comment) throw { status: 404, message: 'Comment not found' };
  return comment;
}

export async function unlikeComment(userId: string, commentId: string) {
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $pull: { likes: userId } },
    { new: true },
  );
  if (!comment) throw { status: 404, message: 'Comment not found' };
  return comment;
}

export async function moderateComment(commentId: string, status: string) {
  const comment = await Comment.findByIdAndUpdate(commentId, { status }, { new: true });
  if (!comment) throw { status: 404, message: 'Comment not found' };
  return comment;
}

export async function deleteComment(userId: string, commentId: string, userRole: string) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw { status: 404, message: 'Comment not found' };

  const isOwner = comment.userId.toString() === userId;
  const isModerator = userRole === 'moderator' || userRole === 'admin';

  if (!isOwner && !isModerator) {
    throw { status: 403, message: 'Not authorized to delete this comment' };
  }

  await Comment.findByIdAndUpdate(commentId, { status: 'deleted' });
  return { message: 'Comment deleted' };
}
