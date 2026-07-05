import { create } from 'zustand';

interface User {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  role: string;
  status: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('admin_user', JSON.stringify(user));
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  setError: (error) => set({ error }),

  logout: () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: () => {
    const userStr = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_access_token');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        const allowedRoles = ['SUPER_ADMIN', 'BRANCH_ADMIN', 'MANAGER', 'RECEPTION', 'TEACHER'];
        if (allowedRoles.includes(user.role)) {
          set({
            user,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch (e) {
        // invalid JSON
      }
    }
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },
}));
