import { apiClient } from './client';

export async function getGroups(): Promise<any[]> {
  const res = await apiClient.get('/groups');
  return res.data.data;
}

export async function createGroup(dto: any): Promise<any> {
  const res = await apiClient.post('/groups', dto);
  return res.data.data;
}

export async function enrollStudent(groupId: string, studentId: string): Promise<any> {
  const res = await apiClient.post(`/groups/${groupId}/students`, { studentId });
  return res.data.data;
}

export async function removeStudent(groupId: string, studentId: string): Promise<any> {
  const res = await apiClient.delete(`/groups/${groupId}/students/${studentId}`);
  return res.data.data;
}

export async function getGroupSchedule(groupId: string): Promise<any[]> {
  const res = await apiClient.get(`/groups/${groupId}/schedule`);
  return res.data.data;
}

export async function getGroupProgress(groupId: string): Promise<any> {
  const res = await apiClient.get(`/groups/${groupId}/progress`);
  return res.data.data;
}

export async function updateGroup(groupId: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/groups/${groupId}`, dto);
  return res.data.data;
}

