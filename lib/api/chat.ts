import { api, ApiResponse } from '../api';

export interface ChatMessage {
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
  imageUrl?: string;
  createdAt: string;
}

export const chatApi = {
  async getMessages(
    groupId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<ChatMessage[]>> {
    const response = await api.get(`/community/chat/${groupId}/messages`, { params });
    return response.data;
  },

  async sendMessage(
    groupId: string,
    content: string,
    imageUrl?: string
  ): Promise<ApiResponse<ChatMessage>> {
    const response = await api.post(`/community/chat/${groupId}/messages`, { content, imageUrl });
    return response.data;
  },
};
