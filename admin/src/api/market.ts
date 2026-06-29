import { apiClient } from './client';

export async function getRewards(): Promise<any[]> {
  const res = await apiClient.get('/market/rewards');
  return res.data.data;
}

export async function createReward(dto: any): Promise<any> {
  const res = await apiClient.post('/market/rewards', dto);
  return res.data.data;
}

export async function updateReward(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/market/rewards/${id}`, dto);
  return res.data.data;
}

export async function deleteReward(id: string): Promise<any> {
  const res = await apiClient.delete(`/market/rewards/${id}`);
  return res.data.data;
}

export async function getPurchases(): Promise<any[]> {
  const res = await apiClient.get('/market/purchases');
  return res.data.data;
}
