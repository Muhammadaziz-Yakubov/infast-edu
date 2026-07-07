import { apiClient } from './client';

export async function getBranches(params?: any): Promise<any> {
  const res = await apiClient.get('/branches', { params });
  return res.data.data;
}

export async function getBranch(id: string): Promise<any> {
  const res = await apiClient.get(`/branches/${id}`);
  return res.data.data;
}

export async function createBranch(dto: any): Promise<any> {
  const res = await apiClient.post('/branches', dto);
  return res.data.data;
}

export async function updateBranch(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/branches/${id}`, dto);
  return res.data.data;
}

export async function deleteBranch(id: string): Promise<any> {
  const res = await apiClient.delete(`/branches/${id}`);
  return res.data.data;
}
