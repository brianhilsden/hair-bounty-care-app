import { api, ApiResponse } from '../api';

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  category: string;
  memberCount: number;
  isJoined?: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  groupId: string;
  content: string;
  imageUrls: string[];
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface CreatePostData {
  content: string;
  imageUrls?: string[];
}

export const communityApi = {
  async getGroups(): Promise<ApiResponse<CommunityGroup[]>> {
    const response = await api.get('/community/groups');
    return response.data;
  },

  async getGroup(id: string): Promise<ApiResponse<CommunityGroup>> {
    const response = await api.get(`/community/groups/${id}`);
    return response.data;
  },

  async joinGroup(id: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/community/groups/${id}/join`);
    return response.data;
  },

  async leaveGroup(id: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/community/groups/${id}/leave`);
    return response.data;
  },

  async getGroupPosts(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<CommunityPost[]>> {
    const response = await api.get(`/community/groups/${id}/posts`, { params });
    return response.data;
  },

  async createPost(id: string, data: CreatePostData): Promise<ApiResponse<CommunityPost>> {
    const response = await api.post(`/community/groups/${id}/posts`, data);
    return response.data;
  },

  async likePost(postId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/community/posts/${postId}/like`);
    return response.data;
  },
};
