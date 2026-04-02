'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useChapter(comicSlug: string, chapSlug: string) {
  return useQuery({
    queryKey: ['chapter', comicSlug, chapSlug],
    queryFn: async () => {
      const { data } = await api.get(`/chapters/${comicSlug}/${chapSlug}`);
      return data.data;
    },
    enabled: !!comicSlug && !!chapSlug,
  });
}
