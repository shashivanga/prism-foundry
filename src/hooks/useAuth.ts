import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import { UserRole } from '@/store/slices/usersSlice';

interface UseAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  
  const { session, getUserById } = useAppStore();
  const currentUser = session.currentUserId ? getUserById(session.currentUserId) : null;
  
  // Mount delay to avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const { requiredRole, redirectTo } = options;
    const isAuthPage = location.pathname.includes('/auth/');
    
    // If not authenticated and not on auth page, redirect to appropriate login
    if (!session.isAuthenticated && !isAuthPage) {
      if (requiredRole === 'client') {
        navigate('/client/auth/login');
      } else {
        navigate('/internal/auth/login');
      }
      return;
    }

    // If authenticated and on auth page, redirect away
    if (session.isAuthenticated && isAuthPage) {
      navigate(redirectTo || '/');
      return;
    }

    // Role-based access control
    if (requiredRole && currentUser) {
      // Admin can access everything
      if (currentUser.role === 'admin') {
        return;
      }
      
      // PM can access PM and client areas
      if (currentUser.role === 'pm' && (requiredRole === 'client' || requiredRole === 'pm')) {
        return;
      }

      // Exact role match
      if (currentUser.role === requiredRole) {
        return;
      }

      // If we get here, access is denied - redirect to appropriate dashboard
      if (currentUser.role === 'client') {
        navigate('/client/dashboard');
      } else if (currentUser.role === 'pm') {
        navigate('/pm/dashboard');
      } else if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isMounted, session.isAuthenticated, currentUser, options, navigate, location.pathname]);

  const logout = () => {
    useAppStore.getState().logout();
    navigate('/');
  };

  return {
    isAuthenticated: session.isAuthenticated,
    currentUser,
    isLoading: !isMounted,
    logout,
    hasRole: (role: UserRole) => {
      if (!currentUser) return false;
      return currentUser.role === role || currentUser.role === 'admin';
    },
    canAccess: (role: UserRole) => {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      if (currentUser.role === 'pm' && (role === 'client' || role === 'pm')) return true;
      return currentUser.role === role;
    }
  };
}