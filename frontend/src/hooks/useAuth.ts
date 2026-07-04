import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { queryClient } from '../lib/queryClient';
import type { LoginRequest, RegisterRequest } from '../types';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Login failed.';
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Account created!');
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed.';
      toast.error(msg);
    },
  });
}

export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
    clearAuth();
    queryClient.clear();
    navigate('/login');
  };
}
