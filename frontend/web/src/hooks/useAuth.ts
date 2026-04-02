'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import type { RootState } from '@/store';
import { setCredentials, logout as logoutAction } from '@/store/slices/authSlice';
import { api } from '@/lib/api';
import type { UserRole } from '@webdoctruyen/shared-fe';
import { hasRole } from '@webdoctruyen/shared-fe';

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const loginMutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', input);
      return data.data as { accessToken: string; user: any };
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: { email: string; password: string; name: string }) => {
      const { data } = await api.post('/auth/register', input);
      return data.data as { accessToken: string; user: any };
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      dispatch(logoutAction());
      router.push('/');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    },
  });

  const checkRole = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    return hasRole(user.role as UserRole, requiredRole);
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    checkRole,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
  };
}
