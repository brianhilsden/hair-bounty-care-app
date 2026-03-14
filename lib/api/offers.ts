import { api, ApiResponse } from '../api';

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface ValidateResult {
  valid: boolean;
  offer?: Offer;
  discountAmount?: number;
  message?: string;
}

export const offersApi = {
  async getActiveOffers(): Promise<ApiResponse<Offer[]>> {
    const response = await api.get('/offers');
    return response.data;
  },

  async validate(code: string, orderAmount?: number): Promise<ApiResponse<ValidateResult>> {
    const response = await api.post('/offers/validate', { code, orderAmount });
    return response.data;
  },

  async apply(code: string, orderAmount?: number): Promise<ApiResponse<ValidateResult>> {
    const response = await api.post('/offers/apply', { code, orderAmount });
    return response.data;
  },
};
