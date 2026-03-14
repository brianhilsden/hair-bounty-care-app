import { api, ApiResponse } from '../api';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requirement: string;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  firstName: string;
  lastName: string;
  rank: number;
  score: number;
  routineCount: number;
  currentStreak: number;
  badgeCount: number;
}

export const gamificationApi = {
  async getAllBadges(): Promise<ApiResponse<Badge[]>> {
    const response = await api.get('/gamification/badges');
    return response.data;
  },

  async getUserBadges(): Promise<ApiResponse<Badge[]>> {
    const response = await api.get('/gamification/badges/me');
    return response.data;
  },

  async checkBadges(): Promise<ApiResponse<Badge[]>> {
    const response = await api.post('/gamification/badges/check');
    return response.data;
  },

  async getLeaderboard(period: 'weekly' | 'all-time' = 'all-time', limit: number = 50): Promise<ApiResponse<LeaderboardEntry[]>> {
    const response = await api.get('/gamification/leaderboard', {
      params: { period, limit },
    });
    return response.data;
  },

  async getUserRank(period: 'weekly' | 'all-time' = 'all-time'): Promise<ApiResponse<LeaderboardEntry>> {
    const response = await api.get('/gamification/leaderboard/me', {
      params: { period },
    });
    return response.data;
  },
};
