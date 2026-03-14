import { api, ApiResponse } from '../api';

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  discountsEarned: number;
  referrals: ReferralEntry[];
}

export interface ReferralEntry {
  id: string;
  referredUser: {
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  discountGiven: boolean;
  createdAt: string;
}

export const referralsApi = {
  async getStats(): Promise<ApiResponse<ReferralStats>> {
    const response = await api.get('/referrals');
    return response.data;
  },

  async getCode(): Promise<ApiResponse<{ code: string }>> {
    const response = await api.get('/referrals/code');
    return response.data;
  },

  async validate(code: string): Promise<ApiResponse<{ valid: boolean; referrerName?: string }>> {
    const response = await api.post('/referrals/validate', { code });
    return response.data;
  },
};
