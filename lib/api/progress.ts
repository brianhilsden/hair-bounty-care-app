import { Platform } from 'react-native';
import { api, ApiResponse } from '../api';

export interface ProgressPhoto {
  id: string;
  userId: string;
  photoUrl: string;
  notes?: string;
  currentLength?: number;
  takenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthStats {
  totalPhotos: number;
  firstPhoto: {
    length: number;
    date: string;
  } | null;
  latestPhoto: {
    length: number;
    date: string;
  } | null;
  totalGrowth: number;
  averageGrowthPerMonth: number;
  journeyDays: number;
}

export interface BeforeAfterComparison {
  before: ProgressPhoto;
  after: ProgressPhoto;
  lengthChange: number | null;
  daysBetween: number;
}

export interface Milestone {
  type: string;
  title: string;
  description: string;
  date?: string;
  icon: string;
}

export interface CreateProgressPhotoData {
  photoUrl: string;
  notes?: string;
  currentLength?: number;
  takenAt?: string;
}

export const progressApi = {
  async createProgressPhoto(data: CreateProgressPhotoData): Promise<ApiResponse<ProgressPhoto>> {
    const response = await api.post('/progress', data);
    return response.data;
  },

  async getProgressPhotos(params?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ProgressPhoto[]>> {
    const response = await api.get('/progress', { params });
    return response.data;
  },

  async getProgressPhotoById(id: string): Promise<ApiResponse<ProgressPhoto>> {
    const response = await api.get(`/progress/${id}`);
    return response.data;
  },

  async updateProgressPhoto(id: string, data: {
    notes?: string;
    currentLength?: number;
  }): Promise<ApiResponse<ProgressPhoto>> {
    const response = await api.patch(`/progress/${id}`, data);
    return response.data;
  },

  async deleteProgressPhoto(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/progress/${id}`);
    return response.data;
  },

  async getGrowthStats(): Promise<ApiResponse<GrowthStats>> {
    const response = await api.get('/progress/stats');
    return response.data;
  },

  async getBeforeAfterComparison(): Promise<ApiResponse<BeforeAfterComparison | null>> {
    const response = await api.get('/progress/comparison');
    return response.data;
  },

  async getProgressMilestones(): Promise<ApiResponse<Milestone[]>> {
    const response = await api.get('/progress/milestones');
    return response.data;
  },

  async uploadProgressPhoto(uri: string): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();

    // @ts-ignore - React Native FormData accepts this format
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('photo', blob, 'progress-photo.jpg');
    } else {
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'progress-photo.jpg',
      } as any);
    }

    const response = await api.post('/upload/progress-photo', formData, {
      headers: {
        ...(Platform.OS === 'web' ? {} : { 'Content-Type': 'multipart/form-data' }),
      },
      transformRequest: (data, headers) => {
        return data;
      },
    });
    return response.data;
  },
};
