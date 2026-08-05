import { apiClient } from './client';

export async function submitAttendance(dto: {
  groupId: string;
  lessonId: string;
  lessonNumber?: number;
  date: string;
  records: { studentId: string; status: 'PRESENT' | 'ABSENT' }[];
}): Promise<any> {
  const res = await apiClient.post('/attendance', dto);
  return res.data.data;
}
