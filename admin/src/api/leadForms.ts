import { apiClient } from './client';

export interface LeadFormItem {
  _id: string;
  title: string;
  source: {
    _id: string;
    name: string;
  } | string;
  description?: string;
  interestedCourse?: {
    _id: string;
    title: string;
  } | string;
  isActive: boolean;
  submissionCount: number;
  createdAt?: string;
}

export async function getLeadForms(): Promise<LeadFormItem[]> {
  const res = await apiClient.get('/lead-forms');
  return res.data.data || res.data;
}

export async function createLeadForm(dto: {
  title: string;
  source: string;
  description?: string;
  interestedCourse?: string;
}): Promise<LeadFormItem> {
  const res = await apiClient.post('/lead-forms', dto);
  return res.data.data || res.data;
}

export async function deleteLeadForm(id: string): Promise<any> {
  const res = await apiClient.delete(`/lead-forms/${id}`);
  return res.data;
}

// Public API calls (can use apiClient or direct axios)
export async function getPublicLeadForm(id: string): Promise<any> {
  const res = await apiClient.get(`/lead-forms/public/${id}`);
  return res.data.data || res.data;
}

export async function submitPublicLeadForm(id: string, dto: {
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
  interestedCourse?: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.post(`/lead-forms/public/${id}/submit`, dto);
  return res.data;
}
