import { api, ApiResponse } from '../api';

export interface RoutineTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  isDefault: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  targetHairTypes: string[];
  targetPorosities: string[];
  targetGoals: string[];
  estimatedMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoutineLog {
  id: string;
  userId: string;
  templateId: string;
  template: RoutineTemplate;
  completedAt: string;
  notes?: string;
}

export interface TodayRoutine extends RoutineTemplate {
  completed: boolean;
  completedAt?: string;
}

export interface UpcomingRoutine extends RoutineTemplate {
  nextDate: string;
  nextLabel: string;
}

export interface RoutineStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  updatedAt: string;
}

export const routineApi = {
  async getTemplates(): Promise<ApiResponse<RoutineTemplate[]>> {
    const response = await api.get('/routines/templates');
    return response.data;
  },

  async getTodayRoutines(): Promise<ApiResponse<TodayRoutine[]>> {
    const response = await api.get('/routines/today');
    return response.data;
  },

  async logRoutine(templateId: string, notes?: string): Promise<ApiResponse<RoutineLog>> {
    const response = await api.post('/routines/log', { templateId, notes });
    return response.data;
  },

  async undoRoutine(templateId: string): Promise<ApiResponse<{ undone: boolean }>> {
    const response = await api.delete(`/routines/log/${templateId}/today`);
    return response.data;
  },

  async getRoutineLogs(params?: {
    startDate?: string;
    endDate?: string;
    templateId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<RoutineLog[]>> {
    const response = await api.get('/routines/logs', { params });
    return response.data;
  },

  async getRoutineStats(): Promise<ApiResponse<RoutineStats>> {
    const response = await api.get('/routines/stats');
    return response.data;
  },

  async getStreak(): Promise<ApiResponse<Streak>> {
    const response = await api.get('/routines/streak');
    return response.data;
  },

  async getMyRoutineTemplates(): Promise<ApiResponse<{ selected: RoutineTemplate[]; available: RoutineTemplate[] }>> {
    const response = await api.get('/routines/my-routines');
    return response.data;
  },

  async addRoutineTemplate(templateId: string): Promise<ApiResponse<void>> {
    const response = await api.post('/routines/my-routines', { templateId });
    return response.data;
  },

  async removeRoutineTemplate(templateId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/routines/my-routines/${templateId}`);
    return response.data;
  },

  async getUpcomingRoutines(): Promise<ApiResponse<UpcomingRoutine[]>> {
    const response = await api.get('/routines/upcoming');
    return response.data;
  },
};
