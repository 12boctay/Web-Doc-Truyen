export type CommentStatus = 'visible' | 'hidden' | 'deleted';
export type NotificationType =
  | 'new_chapter'
  | 'reply_comment'
  | 'announcement'
  | 'chat_message'
  | 'donation_thanks';

export interface IFollow {
  _id: string;
  userId: string;
  comicId: string;
  lastReadChapter: number;
  notifyEnabled: boolean;
  createdAt: Date;
}

export interface IComment {
  _id: string;
  userId: string;
  comicId: string;
  chapterId?: string;
  content: string;
  parentId?: string;
  likes: string[];
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRating {
  _id: string;
  userId: string;
  comicId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationData {
  comicId?: string;
  chapterId?: string;
  commentId?: string;
  chatRoomId?: string;
  paymentId?: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: INotificationData;
  read: boolean;
  createdAt: Date;
}

export interface IReadHistory {
  _id: string;
  userId: string;
  comicId: string;
  chapterId: string;
  chapterNumber: number;
  scrollPosition: number;
  lastReadAt: Date;
}
