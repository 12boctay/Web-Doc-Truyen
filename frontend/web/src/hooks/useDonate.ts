'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useActiveGoals() {
  return useQuery({
    queryKey: ['donation-goals', 'active'],
    queryFn: async () => {
      const { data } = await api.get('/donation-goals/active');
      return data.data;
    },
  });
}

export function useRecentDonations(limit = 10) {
  return useQuery({
    queryKey: ['payments', 'recent', limit],
    queryFn: async () => {
      const { data } = await api.get('/payments/recent', { params: { limit } });
      return data.data;
    },
  });
}

export function useTopDonors(limit = 10) {
  return useQuery({
    queryKey: ['payments', 'top-donors', limit],
    queryFn: async () => {
      const { data } = await api.get('/payments/top-donors', { params: { limit } });
      return data.data;
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      amount: number;
      method: string;
      message?: string;
      displayName?: string;
      isAnonymous?: boolean;
      donationGoalId?: string;
    }) => {
      const { data } = await api.post('/payments', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['donation-goals'] });
    },
  });
}

export function useMyDonations(page = 1) {
  return useQuery({
    queryKey: ['payments', 'my', page],
    queryFn: async () => {
      const { data } = await api.get('/payments/my', { params: { page } });
      return data;
    },
  });
}
