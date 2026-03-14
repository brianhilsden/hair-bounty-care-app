import { Platform } from 'react-native';
import { api, ApiResponse } from '../api';

export interface HairProfile {
  id: string;
  userId: string;
  curlPattern?: string;
  density?: string;
  porosity?: string;
  strandThickness?: string;
  scalpType?: string;
  hairPhotoUrl?: string;
  faceShape?: string;
  goals?: string[];
  currentLength?: number;
  targetLength?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHairProfileData {
  ageGroup?: string;
  gender?: string;
  curlPattern?: string;
  density?: string;
  porosity?: string;
  strandThickness?: string;
  scalpType?: string;
  hairPhotoUrl?: string;
  faceShape?: string;
  goals?: string[];
  currentLength?: number;
  targetLength?: number;
}

export const profileApi = {
  async createProfile(data: CreateHairProfileData): Promise<ApiResponse<HairProfile>> {
    const response = await api.post('/profile', data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<HairProfile>> {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(data: Partial<CreateHairProfileData>): Promise<ApiResponse<HairProfile>> {
    const response = await api.patch('/profile', data);
    return response.data;
  },

  async uploadHairPhoto(uri: string): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();

    // @ts-ignore - React Native FormData accepts this format
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('photo', blob, 'hair-photo.jpg');
    } else {
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'hair-photo.jpg',
      } as any);
    }

    const response = await api.post('/upload/hair-photo', formData, {
      headers: {
        // Let the browser/network layer set the Content-Type with boundary for multipart/form-data
        // Setting it manually to 'multipart/form-data' without boundary causes server to fail parsing
        ...(Platform.OS === 'web' ? {} : { 'Content-Type': 'multipart/form-data' }),
      },
      transformRequest: (data, headers) => {
        return data; 
      },
    });
    return response.data;
  },

  async getDefinitions(): Promise<ApiResponse<any>> {
    const response = await api.get('/profile/definitions');
    return response.data;
  },
};
