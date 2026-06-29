import { apiClient } from './client';

export async function getEvents(): Promise<any[]> {
  const res = await apiClient.get('/events');
  const payload = res.data;
  return Array.isArray(payload) ? payload : (payload?.data ?? []);
}

export async function createEvent(dto: any): Promise<any> {
  const res = await apiClient.post('/events', dto);
  return res.data?.data ?? res.data;
}

export async function submitEventAttendance(eventId: string, attendance: { userId: string; attended: boolean }[]): Promise<any> {
  const res = await apiClient.post(`/events/${eventId}/attendance`, { attendance });
  return res.data?.data ?? res.data;
}

export async function deleteEvent(id: string): Promise<any> {
  const res = await apiClient.delete(`/events/${id}`);
  return res.data?.data ?? res.data;
}
