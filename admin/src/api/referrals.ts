import { apiClient } from './client';

function unwrapArray(res: any): any[] {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  return Array.isArray(d) ? d : [];
}

function unwrapObject(res: any): any {
  return res?.data?.data !== undefined ? res.data.data : res?.data;
}

export const referralsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get('/referrals');
    return unwrapArray(response);
  },

  approve: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/referrals/${id}/approve`);
    return unwrapObject(response);
  },

  reject: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/referrals/${id}/reject`);
    return unwrapObject(response);
  },

  delete: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/referrals/${id}`);
    return unwrapObject(response);
  },
};
