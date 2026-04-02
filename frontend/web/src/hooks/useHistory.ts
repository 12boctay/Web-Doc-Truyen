'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useHistory(page?: number) {
  return useQuery({
    queryKey: ['history', page],
    queryFn: async () => {
      const { data } = await api.get('/history', { params: { page } });
      return data.data;
    },
  });
}

interface SaveProgressInput {
  comicId: string;
  chapterId: string;
  chapterNumber: number;
  scrollPosition: number;
}

export function useSaveProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveProgressInput) => {
      const { data } = await api.post('/history', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
