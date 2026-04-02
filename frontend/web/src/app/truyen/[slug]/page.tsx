'use client';

import { use } from 'react';
import { useComic } from '@/hooks/useComics';
import ComicDetail from '@/components/comic/ComicDetail';
import ChapterList from '@/components/comic/ChapterList';
import CommentSection from '@/components/comic/CommentSection';
import { useComicChapters } from '@/hooks/useComics';
import { useFollowComic, useUnfollowComic } from '@/hooks/useFollow';
import { useMyRating, useRateComic } from '@/hooks/useRatings';

export default function ComicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: comic, isLoading } = useComic(slug);
  const { data: chapters } = useComicChapters(slug);
  const { data: myRating } = useMyRating(comic?._id || '');
  const followMutation = useFollowComic();
  const unfollowMutation = useUnfollowComic();
  const rateMutation = useRateComic();

  if (isLoading) {
    return <div className="animate-pulse"><div className="h-96 rounded-lg bg-gray-200" /></div>;
  }

  if (!comic) {
    return <div className="py-20 text-center text-gray-500">Truyện không tồn tại</div>;
  }

  return (
    <div>
      <ComicDetail
        comic={comic}
        isFollowing={false}
        myRating={myRating?.score || null}
        onFollow={() => followMutation.mutate(comic._id)}
        onRate={(score: number) => rateMutation.mutate({ comicId: comic._id, score })}
      />

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Danh sách chapter</h2>
        <ChapterList chapters={chapters || []} comicSlug={slug} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Bình luận</h2>
        <CommentSection comicId={comic._id} />
      </div>
    </div>
  );
}
