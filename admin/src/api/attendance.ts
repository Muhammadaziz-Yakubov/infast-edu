import { apiClient } from './client';

export async function submitAttendance(dto: {
  groupId: string;
  lessonId?: string;
  lessonNumber?: number;
  date: string;
  records: { studentId: string; status: 'PRESENT' | 'ABSENT' }[];
}): Promise<any> {
  const res = await apiClient.post('/attendance', dto);
  return res.data;
}

export async function getAllAttendanceLogs(): Promise<any[]> {
  const res = await apiClient.get('/attendance/admin/all-logs');
  return res.data;
}

export async function getAcademyConfig(): Promise<{ latitude: number; longitude: number; radiusMeters: number }> {
  const res = await apiClient.get('/attendance/config');
  return res.data;
}

export async function updateAcademyConfig(config: { latitude: number; longitude: number; radiusMeters: number }): Promise<any> {
  const res = await apiClient.post('/attendance/config', config);
  return res.data;
}
