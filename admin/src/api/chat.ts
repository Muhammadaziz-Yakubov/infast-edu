import { apiClient } from './client';

export async function getChatRooms(): Promise<any[]> {
  const res = await apiClient.get('/chat/rooms');
  return res.data.data;
}

export async function getChatMessages(roomId: string, limit = 50, before?: string): Promise<any[]> {
  const params: any = { limit };
  if (before) params.before = before;
  const res = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params });
  return res.data.data;
}

export async function adminSendMessage(roomId: string, text: string): Promise<any> {
  const res = await apiClient.post(`/chat/rooms/${roomId}/messages`, { text });
  return res.data.data;
}

export async function openDirectRoom(studentId: string): Promise<any> {
  const res = await apiClient.post(`/chat/direct/${studentId}`);
  return res.data.data;
}

export async function markRoomRead(roomId: string): Promise<void> {
  await apiClient.post(`/chat/rooms/${roomId}/read`);
}
