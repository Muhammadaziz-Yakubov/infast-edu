import { apiClient } from './client';

export async function getGroups(params?: any): Promise<any[]> {
  const res = await apiClient.get('/groups', { params });
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

export async function getGroupModules(groupId: string): Promise<any[]> {
  const res = await apiClient.get(`/lms/groups/${groupId}/modules`);
  return res.data.data;
}

export async function cloneCourseLmsToGroup(groupId: string, sourceGroupId?: string): Promise<any> {
  const res = await apiClient.post(`/lms/groups/${groupId}/clone${sourceGroupId ? `?sourceGroupId=${sourceGroupId}` : ''}`);
  return res.data.data;
}

