import { api, ApiResponse } from '../api';

export const newsletterApi = {
  async subscribe(email: string): Promise<ApiResponse<{ id: string; email: string; isActive: boolean }>> {
    const response = await api.post('/newsletter/subscribe', { email });
    return response.data;
  },
};
