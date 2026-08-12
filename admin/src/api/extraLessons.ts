import api from './client';

export interface ExtraLessonSlotItem {
  _id: string;
  date: string;
  startTime: string;
  title: string;
  note?: string;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  attendanceStatus: 'PENDING' | 'ATTENDED' | 'ABSENT';
  bookedBy?: {
    _id: string;
    fullName: string;
    phone?: string;
    studentPhone?: string;
    parentPhone?: string;
    avatar?: string;
    email?: string;
  };
  reason?: string;
  bookedAt?: string;
  createdBy?: {
    _id: string;
    fullName: string;
  };
}

export const createExtraLessonSlot = async (data: {
  date: string;
  startTime: string;
  title?: string;
  note?: string;
}): Promise<ExtraLessonSlotItem> => {
  const res = await api.post('/extra-lessons/slots', data);
  return res.data?.data || res.data;
};

export const getExtraLessonSlots = async (date?: string): Promise<ExtraLessonSlotItem[]> => {
  const res = await api.get('/extra-lessons/admin', { params: { date } });
  const data = res.data?.data || res.data;
  return Array.isArray(data) ? data : [];
};

export const deleteExtraLessonSlot = async (id: string): Promise<any> => {
  const res = await api.delete(`/extra-lessons/slots/${id}`);
  return res.data;
};

export const updateExtraLessonAttendance = async (
  id: string,
  attendanceStatus: 'ATTENDED' | 'ABSENT'
): Promise<ExtraLessonSlotItem> => {
  const res = await api.patch(`/extra-lessons/slots/${id}/attendance`, { attendanceStatus });
  return res.data?.data || res.data;
};
