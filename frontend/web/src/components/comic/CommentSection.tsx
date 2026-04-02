'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { formatRelativeTime } from '@webdoctruyen/shared-fe';

interface CommentSectionProps {
  comicId: string;
}

export default function CommentSection({ comicId }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const { data: comments = [], isLoading } = useComments(comicId);
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment(
      { comicId, content: content.trim() },
      { onSuccess: () => setContent('') },
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Bình luận</h2>

      {/* New comment form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </form>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-300 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment: any) => (
            <li key={comment._id} className="flex gap-3">
              <img
                src={comment.user?.avatar || '/default-avatar.png'}
                alt={comment.user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.user?.name || 'Ẩn danh'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                <button className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span>{comment.likes ?? 0}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
