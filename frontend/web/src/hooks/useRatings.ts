'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useComicRating(comicId: string) {
  return useQuery({
    queryKey: ['rating', comicId],
    queryFn: async () => {
      const { data } = await api.get(`/ratings/comic/${comicId}`);
      return data.data;
    },
    enabled: !!comicId,
  });
}

export function useMyRating(comicId: string) {
  return useQuery({
    queryKey: ['myRating', comicId],
    queryFn: async () => {
      const { data } = await api.get(`/ratings/me/${comicId}`);
      return data.data;
    },
    enabled: !!comicId,
  });
}

interface RateComicInput {
  comicId: string;
  score: number;
}

export function useRateComic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RateComicInput) => {
      const { data } = await api.post('/ratings', input);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rating', variables.comicId] });
      queryClient.invalidateQueries({ queryKey: ['myRating', variables.comicId] });
      queryClient.invalidateQueries({ queryKey: ['comic'] });
    },
  });
}
