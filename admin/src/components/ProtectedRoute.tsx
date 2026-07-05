import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const allowedRoles = ['SUPER_ADMIN', 'BRANCH_ADMIN', 'MANAGER', 'RECEPTION', 'TEACHER'];
  if (!isAuthenticated || !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
