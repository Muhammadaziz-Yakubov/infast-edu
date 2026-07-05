import { apiClient } from './client';

// Leads CRUD & CRM actions
export async function getLeads(params: any): Promise<any> {
  const res = await apiClient.get('/leads', { params });
  return res.data.data;
}

export async function getLead(id: string): Promise<any> {
  const res = await apiClient.get(`/leads/${id}`);
  return res.data.data;
}

export async function createLead(dto: any, strategy?: string): Promise<any> {
  const res = await apiClient.post('/leads', dto, { params: { strategy } });
  return res.data.data;
}

export async function updateLead(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/leads/${id}`, dto);
  return res.data.data;
}

export async function mergeLeads(dto: { primaryLeadId: string; secondaryLeadId: string }): Promise<any> {
  const res = await apiClient.post('/leads/merge', dto);
  return res.data.data;
}

export async function archiveLead(id: string): Promise<any> {
  const res = await apiClient.patch(`/leads/${id}/archive`);
  return res.data.data;
}

export async function restoreLead(id: string): Promise<any> {
  const res = await apiClient.patch(`/leads/${id}/restore`);
  return res.data.data;
}

export async function deleteLead(id: string): Promise<any> {
  const res = await apiClient.delete(`/leads/${id}`);
  return res.data.data;
}

// Custom Fields
export async function getCustomFieldDefinitions(): Promise<any[]> {
  const res = await apiClient.get('/custom-field-definitions');
  return res.data.data;
}

export async function createCustomFieldDefinition(dto: any): Promise<any> {
  const res = await apiClient.post('/custom-field-definitions', dto);
  return res.data.data;
}

export async function deleteCustomFieldDefinition(id: string): Promise<any> {
  const res = await apiClient.delete(`/custom-field-definitions/${id}`);
  return res.data.data;
}

// Lead Sources
export async function getLeadSources(): Promise<any[]> {
  const res = await apiClient.get('/lead-sources');
  return res.data.data;
}

export async function createLeadSource(dto: any): Promise<any> {
  const res = await apiClient.post('/lead-sources', dto);
  return res.data.data;
}

export async function deleteLeadSource(id: string): Promise<any> {
  const res = await apiClient.delete(`/lead-sources/${id}`);
  return res.data.data;
}

// Campaigns
export async function getCampaigns(): Promise<any[]> {
  const res = await apiClient.get('/campaigns');
  return res.data.data;
}

export async function createCampaign(dto: any): Promise<any> {
  const res = await apiClient.post('/campaigns', dto);
  return res.data.data;
}

export async function updateCampaign(id: string, dto: any): Promise<any> {
  const res = await apiClient.patch(`/campaigns/${id}`, dto);
  return res.data.data;
}

export async function deleteCampaign(id: string): Promise<any> {
  const res = await apiClient.delete(`/campaigns/${id}`);
  return res.data.data;
}

export async function getCampaignPerformance(id: string): Promise<any> {
  const res = await apiClient.get(`/campaigns/${id}/performance`);
  return res.data.data;
}

// Call Logs
export async function createCallLog(dto: any): Promise<any> {
  const res = await apiClient.post('/calls', dto);
  return res.data.data;
}

export async function getCallLogs(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/calls/lead/${leadId}`);
  return res.data.data;
}

// Meetings
export async function createMeeting(dto: any): Promise<any> {
  const res = await apiClient.post('/meetings', dto);
  return res.data.data;
}

export async function updateMeetingStatus(id: string, status: string): Promise<any> {
  const res = await apiClient.patch(`/meetings/${id}/status`, { status });
  return res.data.data;
}

export async function getMeetings(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/meetings/lead/${leadId}`);
  return res.data.data;
}

// Demo Lessons
export async function createDemoLesson(dto: any): Promise<any> {
  const res = await apiClient.post('/demo-lessons', dto);
  return res.data.data;
}

export async function getDemoLessons(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/demo-lessons/lead/${leadId}`);
  return res.data.data;
}

// Notes
export async function createNote(leadId: string, content: string): Promise<any> {
  const res = await apiClient.post('/notes', { leadId, content });
  return res.data.data;
}

export async function getNotes(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/notes/lead/${leadId}`);
  return res.data.data;
}

export async function deleteNote(id: string): Promise<any> {
  const res = await apiClient.delete(`/notes/${id}`);
  return res.data.data;
}

// Tasks
export async function createTask(dto: any): Promise<any> {
  const res = await apiClient.post('/tasks', dto);
  return res.data.data;
}

export async function updateTaskStatus(id: string, status: string): Promise<any> {
  const res = await apiClient.patch(`/tasks/${id}/status`, { status });
  return res.data.data;
}

export async function getTasks(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/tasks/lead/${leadId}`);
  return res.data.data;
}

export async function deleteTask(id: string): Promise<any> {
  const res = await apiClient.delete(`/tasks/${id}`);
  return res.data.data;
}

// Follow Ups
export async function createFollowUp(dto: any): Promise<any> {
  const res = await apiClient.post('/follow-ups', dto);
  return res.data.data;
}

export async function updateFollowUpStatus(id: string, status: string): Promise<any> {
  const res = await apiClient.patch(`/follow-ups/${id}/status`, { status });
  return res.data.data;
}

export async function getFollowUps(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/follow-ups/lead/${leadId}`);
  return res.data.data;
}

// Attachments
export async function createAttachment(dto: any): Promise<any> {
  const res = await apiClient.post('/attachments', dto);
  return res.data.data;
}

export async function getAttachments(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/attachments/lead/${leadId}`);
  return res.data.data;
}

export async function deleteAttachment(id: string): Promise<any> {
  const res = await apiClient.delete(`/attachments/${id}`);
  return res.data.data;
}

// Conversions
export async function convertLead(leadId: string, data: any): Promise<any> {
  const res = await apiClient.post(`/conversions/${leadId}/convert`, data);
  return res.data.data;
}

// CRM Analytics & Reporting
export async function getCrmDashboard(): Promise<any> {
  const res = await apiClient.get('/crm-analytics/dashboard');
  return res.data.data;
}

export async function getCrmFunnel(): Promise<any[]> {
  const res = await apiClient.get('/crm-analytics/funnel');
  return res.data.data;
}

export async function getCrmLostReasons(): Promise<any[]> {
  const res = await apiClient.get('/crm-analytics/lost-reasons');
  return res.data.data;
}

export async function getCrmCourseAnalytics(): Promise<any[]> {
  const res = await apiClient.get('/crm-analytics/courses');
  return res.data.data;
}

export async function getCrmManagersPerformance(): Promise<any[]> {
  const res = await apiClient.get('/crm-analytics/managers');
  return res.data.data;
}

// Activities Audit
export async function getActivities(leadId: string): Promise<any[]> {
  const res = await apiClient.get(`/activities/lead/${leadId}`);
  return res.data.data;
}
