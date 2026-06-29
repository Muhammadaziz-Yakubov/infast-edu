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
