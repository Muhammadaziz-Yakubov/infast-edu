import { apiClient } from './client';

export interface TelegramAiStatus {
  connected: boolean;
  authorized: boolean;
  phone?: string;
  error?: string;
}

export const telegramAiApi = {
  getStatus: async (): Promise<TelegramAiStatus> => {
    const response = await apiClient.get('/telegram-ai/status');
    // Ensure we handle response structure if it uses the standard transform envelope
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  startAgent: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/telegram-ai/start');
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  stopAgent: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/telegram-ai/stop');
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  submitCode: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/telegram-ai/submit-code', { code });
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/telegram-ai/logout');
    return response.data.data !== undefined ? response.data.data : response.data;
  },
};
