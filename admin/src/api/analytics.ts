import { apiClient } from './client';

export async function getDashboardAnalytics(params?: any): Promise<any> {
  const res = await apiClient.get('/analytics/dashboard', { params });
  return res.data.data;
}
