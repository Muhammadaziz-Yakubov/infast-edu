import { apiClient } from './client';

export async function getPayments(): Promise<any[]> {
  const res = await apiClient.get('/payments');
  return res.data.data;
}

export async function getStudentPayments(studentId: string): Promise<any[]> {
  const res = await apiClient.get(`/payments/students/${studentId}`);
  return res.data.data;
}

export async function getStudentPaymentSummary(studentId: string): Promise<any> {
  const res = await apiClient.get(`/payments/students/${studentId}/summary`);
  return res.data.data;
}

export async function confirmPayment(dto: any): Promise<any> {
  const res = await apiClient.post('/payments', dto);
  return res.data.data;
}

export async function getOverdueStudents(): Promise<any[]> {
  const res = await apiClient.get('/payments/overdue');
  return res.data.data;
}
