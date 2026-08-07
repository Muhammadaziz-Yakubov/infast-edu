import { apiClient } from './client';

function unwrapArray(res: any): any[] {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  return Array.isArray(d) ? d : [];
}

function unwrapObject(res: any): any {
  return res?.data?.data !== undefined ? res.data.data : res?.data;
}

export async function getStudents(params?: any): Promise<any[]> {
  const res = await apiClient.get('/students', { params });
  return unwrapArray(res);
}

export async function getStudentProfile(id: string): Promise<any> {
  const res = await apiClient.get(`/students/${id}`);
  return unwrapObject(res);
}

export async function createStudent(dto: any): Promise<any> {
  const res = await apiClient.post('/students', dto);
  return unwrapObject(res);
}

export async function updateStudent(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/students/${id}`, dto);
  return unwrapObject(res);
}

export async function deleteStudent(id: string): Promise<any> {
  const res = await apiClient.delete(`/students/${id}`);
  return unwrapObject(res);
}

export async function getLeaderboard(): Promise<any[]> {
  const res = await apiClient.get('/students/leaderboard');
  return unwrapArray(res);
}

export async function getStudentContract(id: string): Promise<any> {
  const res = await apiClient.get(`/students/${id}/contract`);
  return unwrapObject(res);
}

export async function generateStudentContract(id: string, dto: any): Promise<any> {
  const res = await apiClient.post(`/students/${id}/contract/generate`, dto);
  return unwrapObject(res);
}

export async function resetAllStudentsXp(): Promise<any> {
  const res = await apiClient.post('/students/reset-all-xp');
  return unwrapObject(res);
}

export async function resetStudentXp(id: string): Promise<any> {
  const res = await apiClient.post(`/students/${id}/reset-xp`);
  return unwrapObject(res);
}
