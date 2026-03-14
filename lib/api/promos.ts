import { api, ApiResponse } from '../api';

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minPurchase?: number;
}

export const promosApi = {
  async validate(code: string): Promise<ApiResponse<PromoCode>> {
    const response = await api.post('/promos/validate', { code });
    return response.data;
  },
};
