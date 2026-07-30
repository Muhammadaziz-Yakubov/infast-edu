import { apiClient } from './client';

function unwrapArray(res: any): any[] {
  const d = res?.data?.data !== undefined ? res.data.data : res?.data;
  return Array.isArray(d) ? d : [];
}

function unwrapObject(res: any): any {
  return res?.data?.data !== undefined ? res.data.data : res?.data;
}

export async function getCourses(): Promise<any[]> {
  const res = await apiClient.get('/courses');
  return unwrapArray(res);
}

export async function createCourse(dto: any): Promise<any> {
  const res = await apiClient.post('/courses', dto);
  return unwrapObject(res);
}

export async function createModule(dto: any): Promise<any> {
  const res = await apiClient.post('/lms/modules', dto);
  return unwrapObject(res);
}

export async function createLesson(dto: any): Promise<any> {
  const res = await apiClient.post('/lms/lessons', dto);
  return unwrapObject(res);
}

export async function updateCourseModules(courseId: string, modules: any[]): Promise<void> {
  await apiClient.put(`/courses/${courseId}/modules`, { modules });
}

export async function importCourse(importData: any): Promise<any> {
  const res = await apiClient.post('/courses/import', importData);
  return unwrapObject(res);
}

export async function updateLesson(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/lms/lessons/${id}`, dto);
  return unwrapObject(res);
}

export async function deleteLesson(id: string): Promise<any> {
  const res = await apiClient.delete(`/lms/lessons/${id}`);
  return unwrapObject(res);
}

export async function duplicateLesson(id: string, targetModuleId: string): Promise<any> {
  const res = await apiClient.post(`/lms/lessons/${id}/duplicate`, { targetModuleId });
  return unwrapObject(res);
}
