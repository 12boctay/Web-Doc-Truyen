'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSearch(query: string, page?: number) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: async () => {
      const { data } = await api.get('/search', {
        params: { q: query, page },
      });
      return data.data;
    },
    enabled: query.length >= 2,
  });
}

export function useSuggest(query: string) {
  return useQuery({
    queryKey: ['suggest', query],
    queryFn: async () => {
      const { data } = await api.get('/search/suggest', {
        params: { q: query },
      });
      return data.data;
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
