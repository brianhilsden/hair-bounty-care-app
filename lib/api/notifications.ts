import { api, ApiResponse } from '../api';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

export const notificationsApi = {
  async getNotifications(): Promise<ApiResponse<NotificationsResponse>> {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markRead(id: string): Promise<ApiResponse<AppNotification>> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead(): Promise<ApiResponse<void>> {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  async registerPushToken(token: string): Promise<ApiResponse<void>> {
    const response = await api.post('/notifications/register-token', { pushToken: token });
    return response.data;
  },
};
