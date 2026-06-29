import { apiClient } from './client';

export async function getStories(): Promise<any[]> {
  const res = await apiClient.get('/lms/stories');
  const payload = res.data;
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}

export async function createStory(dto: any): Promise<any> {
  const res = await apiClient.post('/lms/stories', dto);
  return res.data?.data ?? res.data;
}

export async function deleteStory(id: string): Promise<any> {
  const res = await apiClient.delete(`/lms/stories/${id}`);
  return res.data?.data ?? res.data;
}
