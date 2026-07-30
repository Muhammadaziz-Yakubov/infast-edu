import api from './client';

export interface StudentCoinInfo {
  _id: string;
  fullName: string;
  email?: string;
  studentPhone?: string;
  avatar?: string;
  coins: number;
  xp: number;
  level: number;
  status: string;
}

export const getStudentsCoins = async (): Promise<StudentCoinInfo[]> => {
  const res = await api.get('/students');
  return res.data;
};

export const adjustStudentCoins = async (
  studentId: string,
  amount: number,
  type: 'ADD' | 'DEDUCT',
  reason: string
): Promise<any> => {
  const res = await api.post(`/students/${studentId}/coins`, {
    amount,
    type,
    reason,
  });
  return res.data;
};
