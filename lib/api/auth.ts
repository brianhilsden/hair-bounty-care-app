import { api, ApiResponse } from '../api';
import type { LoginInput, RegisterInput, ForgotPasswordInput } from '../validations/auth.schema';
import type { User, Subscription } from '../../store/authStore';

export interface AuthResponse {
  user: User;
  subscription?: Subscription;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  async register(data: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: AuthResponse['tokens'] }>> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
