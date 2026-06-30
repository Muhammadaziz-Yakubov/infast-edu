import { apiClient } from './client';

export async function broadcastNotification(title: string, message: string): Promise<any> {
  const res = await apiClient.post('/notifications/broadcast', { title, message });
  return res.data;
}
