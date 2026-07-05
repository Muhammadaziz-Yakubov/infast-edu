import { apiClient } from './client';

export async function getAiAdvisorDashboard(): Promise<any> {
  const res = await apiClient.get('/ai/dashboard');
  return res.data.data;
}
