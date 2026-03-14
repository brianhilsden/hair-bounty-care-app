import { api, ApiResponse } from '../api';

export interface HairstyleRec {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export interface ProductRec {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  price: number;
  currency: string;
  rating: number;
  reason: string;
}

export interface DIYRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  duration: string;
  benefits: string[];
  suitableFor: string[];
}

export const recommendationsApi = {
  async getHairstyles(): Promise<ApiResponse<HairstyleRec[]>> {
    const response = await api.get('/recommendations/hairstyles');
    return response.data;
  },

  async getProducts(): Promise<ApiResponse<ProductRec[]>> {
    const response = await api.get('/recommendations/products');
    return response.data;
  },

  async getDIYRecipes(): Promise<ApiResponse<DIYRecipe[]>> {
    const response = await api.get('/recommendations/diy');
    return response.data;
  },
};
