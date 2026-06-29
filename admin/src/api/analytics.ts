import { apiClient } from './client';

export async function getDashboardAnalytics(): Promise<any> {
  const res = await apiClient.get('/analytics/dashboard');
  return res.data.data;
}
