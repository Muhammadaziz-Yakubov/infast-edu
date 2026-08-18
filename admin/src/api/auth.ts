import { apiClient } from './client';

export async function login(dto: any) {
  const res = await apiClient.post('/auth/login', dto);
  return res.data.data; // { user, accessToken, refreshToken }
}

export async function refresh(refreshToken: string) {
  const res = await apiClient.post('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function changePassword(dto: any) {
  const res = await apiClient.post('/auth/change-password', dto);
  return res.data.data;
}

export async function recoverPassword(dto: { email: string; hint: string }) {
  const res = await apiClient.post('/auth/recover-password', dto);
  return res.data.data;
}
