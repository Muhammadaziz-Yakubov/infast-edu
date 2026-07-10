import { apiClient } from './client';

export async function getCourses(): Promise<any[]> {
  const res = await apiClient.get('/courses');
  return res.data.data;
}

export async function createCourse(dto: any): Promise<any> {
  const res = await apiClient.post('/courses', dto);
  return res.data.data;
}

export async function createModule(dto: any): Promise<any> {
  const res = await apiClient.post('/lms/modules', dto);
  return res.data.data;
}

export async function createLesson(dto: any): Promise<any> {
  const res = await apiClient.post('/lms/lessons', dto);
  return res.data.data;
}

export async function updateCourseModules(courseId: string, modules: any[]): Promise<void> {
  await apiClient.put(`/courses/${courseId}/modules`, { modules });
}

export async function importCourse(importData: any): Promise<any> {
  const res = await apiClient.post('/courses/import', importData);
  return res.data.data;
}

export async function updateLesson(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/lms/lessons/${id}`, dto);
  return res.data.data;
}

export async function deleteLesson(id: string): Promise<any> {
  const res = await apiClient.delete(`/lms/lessons/${id}`);
  return res.data.data;
}

export async function duplicateLesson(id: string, targetModuleId: string): Promise<any> {
  const res = await apiClient.post(`/lms/lessons/${id}/duplicate`, { targetModuleId });
  return res.data.data;
}
