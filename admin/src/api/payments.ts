import { apiClient } from './client';

function unwrapArray(res: any): any[] {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  return Array.isArray(d) ? d : [];
}

function unwrapObject(res: any): any {
  return res?.data?.data !== undefined ? res.data.data : res?.data;
}

export async function getPayments(): Promise<any[]> {
  const res = await apiClient.get('/payments');
  return unwrapArray(res);
}

export async function getStudentPayments(studentId: string): Promise<any[]> {
  const res = await apiClient.get(`/payments/students/${studentId}`);
  return unwrapArray(res);
}

export async function getStudentPaymentSummary(studentId: string): Promise<any> {
  const res = await apiClient.get(`/payments/students/${studentId}/summary`);
  return unwrapObject(res);
}

export async function confirmPayment(dto: any): Promise<any> {
  const res = await apiClient.post('/payments', dto);
  return unwrapObject(res);
}

export async function getOverdueStudents(): Promise<any[]> {
  const res = await apiClient.get('/payments/overdue');
  return unwrapArray(res);
}

export async function checkPaymentStatuses(): Promise<any> {
  const res = await apiClient.post('/payments/check-statuses');
  return unwrapObject(res);
}

