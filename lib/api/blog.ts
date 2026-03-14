import { api, ApiResponse } from '../api';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string; // only on detail
  coverUrl: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
}

export const blogApi = {
  async getPosts(params?: { category?: string; page?: number; limit?: number }): Promise<ApiResponse<BlogPost[]>> {
    const response = await api.get('/blog', { params });
    return response.data;
  },

  async getPost(slug: string): Promise<ApiResponse<BlogPost>> {
    const response = await api.get(`/blog/${slug}`);
    return response.data;
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await api.get('/blog/categories');
    return response.data;
  },
};
