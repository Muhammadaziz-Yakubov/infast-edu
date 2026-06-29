import { apiClient } from './client';

export async function createHomework(dto: any): Promise<any> {
  const res = await apiClient.post('/homework', dto);
  return res.data.data;
}

export async function getSubmissions(): Promise<any[]> {
  const res = await apiClient.get('/homework/submissions');
  return res.data.data;
}

export async function gradeSubmission(submissionId: string, score: number): Promise<any> {
  const res = await apiClient.post(`/homework/submissions/${submissionId}/grade`, { score });
  return res.data.data;
}
