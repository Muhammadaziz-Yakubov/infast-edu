import { apiClient } from './client';

export async function getStudents(params?: any): Promise<any[]> {
  const res = await apiClient.get('/students', { params });
  return res.data.data;
}

export async function getStudentProfile(id: string): Promise<any> {
  const res = await apiClient.get(`/students/${id}`);
  return res.data.data;
}

export async function createStudent(dto: any): Promise<any> {
  const res = await apiClient.post('/students', dto);
  return res.data.data;
}

export async function updateStudent(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/students/${id}`, dto);
  return res.data.data;
}

export async function deleteStudent(id: string): Promise<any> {
  const res = await apiClient.delete(`/students/${id}`);
  return res.data.data;
}

export async function getLeaderboard(): Promise<any[]> {
  const res = await apiClient.get('/students/leaderboard');
  return res.data.data;
}

export async function getStudentContract(id: string): Promise<any> {
  const res = await apiClient.get(`/students/${id}/contract`);
  return res.data.data;
}

export async function generateStudentContract(id: string, dto: any): Promise<any> {
  const res = await apiClient.post(`/students/${id}/contract/generate`, dto);
  return res.data.data;
}
