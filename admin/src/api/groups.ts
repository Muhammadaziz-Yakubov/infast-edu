import { apiClient } from './client';

function unwrapArray(res: any): any[] {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  return Array.isArray(d) ? d : [];
}

function unwrapObject(res: any): any {
  return res?.data?.data !== undefined ? res.data.data : res?.data;
}

export async function getGroups(params?: any): Promise<any[]> {
  const res = await apiClient.get('/groups', { params });
  return unwrapArray(res);
}

export async function createGroup(dto: any): Promise<any> {
  const res = await apiClient.post('/groups', dto);
  return unwrapObject(res);
}

export async function enrollStudent(groupId: string, studentId: string): Promise<any> {
  const res = await apiClient.post(`/groups/${groupId}/students`, { studentId });
  return unwrapObject(res);
}

export async function removeStudent(groupId: string, studentId: string): Promise<any> {
  const res = await apiClient.delete(`/groups/${groupId}/students/${studentId}`);
  return unwrapObject(res);
}

export async function getGroupSchedule(groupId: string): Promise<any[]> {
  const res = await apiClient.get(`/groups/${groupId}/schedule`);
  return unwrapArray(res);
}

export async function getGroupProgress(groupId: string): Promise<any> {
  const res = await apiClient.get(`/groups/${groupId}/progress`);
  return unwrapObject(res);
}

export async function updateGroup(groupId: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/groups/${groupId}`, dto);
  return unwrapObject(res);
}

export async function getGroupModules(groupId: string): Promise<any[]> {
  const res = await apiClient.get(`/lms/groups/${groupId}/modules`);
  return unwrapArray(res);
}

export async function cloneCourseLmsToGroup(groupId: string, sourceGroupId?: string): Promise<any> {
  const res = await apiClient.post(`/lms/groups/${groupId}/clone${sourceGroupId ? `?sourceGroupId=${sourceGroupId}` : ''}`);
  return unwrapObject(res);
}

