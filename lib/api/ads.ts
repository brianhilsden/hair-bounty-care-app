import { api, ApiResponse } from '../api';

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  ctaText?: string;
}

export const adsApi = {
  async getAd(placement: string): Promise<ApiResponse<Ad>> {
    const response = await api.get(`/ads/${placement}`);
    return response.data;
  },

  async trackClick(id: string): Promise<ApiResponse<{ targetUrl: string }>> {
    const response = await api.post(`/ads/${id}/click`);
    return response.data;
  },
};
