import api from './client';

export interface LibraryItem {
  _id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'BOOK';
  url: string;
  thumbnailUrl?: string;
  author?: string;
  category?: string;
  createdAt?: string;
}

export const getLibraryItems = async (type?: string): Promise<LibraryItem[]> => {
  const res = await api.get('/library', { params: { type } });
  return res.data;
};

export const createLibraryItem = async (dto: Partial<LibraryItem>): Promise<LibraryItem> => {
  const res = await api.post('/library', dto);
  return res.data;
};

export const updateLibraryItem = async (id: string, dto: Partial<LibraryItem>): Promise<LibraryItem> => {
  const res = await api.patch(`/library/${id}`, dto);
  return res.data;
};

export const deleteLibraryItem = async (id: string): Promise<any> => {
  const res = await api.delete(`/library/${id}`);
  return res.data;
};
