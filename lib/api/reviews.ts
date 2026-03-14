import { api, ApiResponse } from '../api';

export interface Review {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  targetType: 'product' | 'salon' | 'general';
  targetId?: string;
  rating: number;   // 1–5
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface CreateReviewData {
  targetType: 'product' | 'salon' | 'general';
  targetId?: string;
  rating: number;
  content: string;
  imageUrls?: string[];
}

export const reviewsApi = {
  async getReviews(params?: {
    targetType?: string;
    targetId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Review[]>> {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  async createReview(data: CreateReviewData): Promise<ApiResponse<Review>> {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  async getReviewsForTarget(
    targetType: string,
    targetId: string
  ): Promise<ApiResponse<Review[]>> {
    const response = await api.get(`/reviews/${targetType}/${targetId}`);
    return response.data;
  },
};
