import { create } from 'zustand';
import { router } from 'expo-router';
import { tokenManager } from '../lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  ageGroup?: string;
  gender?: string;
  role: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  referralCode: string;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  plan: 'FREE_TRIAL' | 'MONTHLY' | 'ANNUAL';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setSubscription: (subscription) =>
    set({ subscription }),

  setTokens: async (accessToken, refreshToken) => {
    await tokenManager.setTokens(accessToken, refreshToken);
  },

  logout: async () => {
    await tokenManager.clearTokens();
    set({
      user: null,
      subscription: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.replace('/(auth)/welcome');
  },

  checkAuth: async () => {
    try {
      const accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        set({ isAuthenticated: false, isLoading: false, user: null });
        return false;
      }
      
      const { authApi } = await import('../lib/api/auth');
      const response = await authApi.getMe();
      
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('[AuthStore] Failed to authenticate user:', error);
      await tokenManager.clearTokens();
      set({ isAuthenticated: false, isLoading: false, user: null });
      return false;
    }
  },
}));
