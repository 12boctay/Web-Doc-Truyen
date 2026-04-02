'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useFollows(page?: number) {
  return useQuery({
    queryKey: ['follows', page],
    queryFn: async () => {
      const { data } = await api.get('/follows', { params: { page } });
      return data.data;
    },
  });
}

export function useFollowComic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comicId: string) => {
      const { data } = await api.post(`/follows/${comicId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['comic'] });
    },
  });
}

export function useUnfollowComic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comicId: string) => {
      const { data } = await api.delete(`/follows/${comicId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['comic'] });
    },
  });
}
