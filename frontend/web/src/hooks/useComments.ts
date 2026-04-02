'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useComments(comicId: string, page?: number) {
  return useQuery({
    queryKey: ['comments', comicId, page],
    queryFn: async () => {
      const { data } = await api.get(`/comments/comic/${comicId}`, {
        params: { page },
      });
      return data.data;
    },
    enabled: !!comicId,
  });
}

interface CreateCommentInput {
  comicId: string;
  content: string;
  parentId?: string;
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const { data } = await api.post('/comments', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useLikeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/comments/${id}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useUnlikeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/comments/${id}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}
