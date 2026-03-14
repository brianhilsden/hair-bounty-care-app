import { api, ApiResponse } from '../api';

export interface Salon {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  imageUrls: string[];
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isHighEnd: boolean;
  isBudget: boolean;
  isKidsFriendly: boolean;
  isOrganic: boolean;
  isGreenCertified: boolean;
  specialties: string[];
  rating: number;
  reviewCount: number;
  isAffiliate: boolean;
  distance?: number; // km, only for nearby
}

export const salonsApi = {
  async getSalons(params?: {
    city?: string; search?: string; isHighEnd?: boolean;
    isBudget?: boolean; isKidsFriendly?: boolean; isOrganic?: boolean;
    isGreenCertified?: boolean; specialty?: string; page?: number; limit?: number;
  }): Promise<ApiResponse<Salon[]>> {
    const response = await api.get('/salons', { params });
    return response.data;
  },

  async getSalon(id: string): Promise<ApiResponse<Salon>> {
    const response = await api.get(`/salons/${id}`);
    return response.data;
  },

  async getNearby(lat: number, lng: number, radius?: number): Promise<ApiResponse<Salon[]>> {
    const response = await api.get('/salons/nearby', { params: { lat, lng, radius } });
    return response.data;
  },
};
