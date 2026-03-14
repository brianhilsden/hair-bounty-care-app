import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../lib/api/auth';
import { tokenManager } from '../lib/api';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, subscription, isAuthenticated, isLoading, setUser, setSubscription, setTokens, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: async (res) => {
      if (res.data) {
        await setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        setUser(res.data.user);
        if (res.data.subscription) setSubscription(res.data.subscription);
        router.replace(res.data.user.isOnboarded ? '/(tabs)/home' : '/(onboarding)/age-group');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; firstName: string; lastName: string; referralCode?: string }) =>
      authApi.register(data),
    onSuccess: async (res) => {
      if (res.data) {
        await setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        setUser(res.data.user);
        router.replace('/(onboarding)/age-group');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try { 
        const token = await tokenManager.getRefreshToken();
        if (token) await authApi.logout(token);
      } catch { /* ignore network errors on logout */ }
    },
    onSettled: async () => {
      await storeLogout();
      queryClient.clear();
      router.replace('/(auth)/welcome');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
  });

  return {
    user,
    subscription,
    isAuthenticated,
    isLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    forgotPassword: forgotPasswordMutation,
  };
}
