import { api } from '../api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { content: string; role: string }[];
}

export interface AiConversationDetail {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; role: string; content: string; order: number; createdAt: string }[];
}

export const aiApi = {
  chat: async (
    messages: ChatMessage[],
    conversationId?: string
  ): Promise<{ reply: string; conversationId: string }> => {
    const res = await api.post<{
      success: boolean;
      data: { reply: string; conversationId: string };
    }>('/ai/chat', { messages, conversationId });
    return res.data.data;
  },

  listConversations: async (): Promise<AiConversationSummary[]> => {
    const res = await api.get<{ success: boolean; data: AiConversationSummary[] }>(
      '/ai/conversations'
    );
    return res.data.data;
  },

  getConversation: async (id: string): Promise<AiConversationDetail> => {
    const res = await api.get<{ success: boolean; data: AiConversationDetail }>(
      `/ai/conversations/${id}`
    );
    return res.data.data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/ai/conversations/${id}`);
  },
};
