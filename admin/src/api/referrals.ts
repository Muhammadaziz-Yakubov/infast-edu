import { apiClient } from './client';

export const referralsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get('/referrals');
    return response.data.data;
  },

  approve: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/referrals/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/referrals/${id}/reject`);
    return response.data.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/referrals/${id}`);
    return response.data.data;
  },
};
