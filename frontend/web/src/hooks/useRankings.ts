'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRankings(type: string) {
  return useQuery({
    queryKey: ['rankings', type],
    queryFn: async () => {
      const { data } = await api.get(`/rankings/${type}`);
      return data.data;
    },
    staleTime: 15 * 60 * 1000,
  });
}
