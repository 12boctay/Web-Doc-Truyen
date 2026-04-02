'use client';

import Link from 'next/link';
import { formatRelativeTime } from '@webdoctruyen/shared-fe';

interface Chapter {
  _id: string;
  number: number;
  title: string;
  createdAt: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  comicSlug: string;
}

export default function ChapterList({ chapters, comicSlug }: ChapterListProps) {
  const sorted = [...chapters].sort((a, b) => b.number - a.number);

  return (
    <div className="border rounded-lg overflow-hidden">
      <h2 className="px-4 py-3 bg-gray-50 font-semibold text-gray-900 border-b">
        Danh sách chương
      </h2>
      <ul className="divide-y max-h-[500px] overflow-y-auto">
        {sorted.map((ch) => (
          <li key={ch._id}>
            <Link
              href={`/truyen/${comicSlug}/chapter-${ch.number}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-800">
                Chapter {ch.number}
                {ch.title ? `: ${ch.title}` : ''}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                {formatRelativeTime(ch.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
