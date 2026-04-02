'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ComicFilters {
  page?: number;
  limit?: number;
  country?: string;
  category?: string;
  status?: string;
  sort?: string;
}

export function useComics(filters?: ComicFilters) {
  return useQuery({
    queryKey: ['comics', filters],
    queryFn: async () => {
      const { data } = await api.get('/comics', { params: filters });
      return data.data;
    },
  });
}

export function useComic(slug: string) {
  return useQuery({
    queryKey: ['comic', slug],
    queryFn: async () => {
      const { data } = await api.get(`/comics/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useComicChapters(slug: string) {
  return useQuery({
    queryKey: ['chapters', slug],
    queryFn: async () => {
      const { data } = await api.get(`/comics/${slug}/chapters`);
      return data.data;
    },
    enabled: !!slug,
  });
}

export function useHotComics() {
  return useQuery({
    queryKey: ['comics', 'hot'],
    queryFn: async () => {
      const { data } = await api.get('/comics/hot');
      return data.data;
    },
  });
}

export function useRecommendedComics() {
  return useQuery({
    queryKey: ['comics', 'recommended'],
    queryFn: async () => {
      const { data } = await api.get('/comics/recommended');
      return data.data;
    },
  });
}
