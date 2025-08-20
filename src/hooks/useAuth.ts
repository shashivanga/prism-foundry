import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'client' | 'pm' | 'admin';

interface UseAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const { login, logout: storeLogout } = useAppStore();
  
  // Set up auth state listener and get initial session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update store session
        if (session?.user) {
          login(session.user.id, session.access_token, new Date(session.expires_at! * 1000));
          
          // Fetch user profile data
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              setUserProfile(profile);
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
            }
          }, 0);
        } else {
          storeLogout();
          setUserProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        login(session.user.id, session.access_token, new Date(session.expires_at! * 1000));
      }
    });

    const timer = setTimeout(() => setIsMounted(true), 100);
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const { requiredRole, redirectTo } = options;
    const isAuthPage = location.pathname.includes('/auth/');
    
    // If not authenticated and not on auth page, redirect to appropriate login
    if (!user && !isAuthPage) {
      if (requiredRole === 'client') {
        navigate('/client/auth/login');
      } else {
        navigate('/internal/auth/login');
      }
      return;
    }

    // If authenticated and on auth page, redirect away
    if (user && isAuthPage) {
      navigate(redirectTo || '/');
      return;
    }

    // Role-based access control
    if (requiredRole && userProfile) {
      // Admin can access everything
      if (userProfile.role === 'admin') {
        return;
      }
      
      // PM can access PM and client areas
      if (userProfile.role === 'pm' && (requiredRole === 'client' || requiredRole === 'pm')) {
        return;
      }

      // Exact role match
      if (userProfile.role === requiredRole) {
        return;
      }

      // If we get here, access is denied - redirect to appropriate dashboard
      if (userProfile.role === 'client') {
        navigate('/client/projects');
      } else if (userProfile.role === 'pm') {
        navigate('/internal/projects');
      } else if (userProfile.role === 'admin') {
        navigate('/internal/projects');
      } else {
        navigate('/');
      }
    }
  }, [isMounted, user, userProfile, options, navigate, location.pathname]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      storeLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      storeLogout();
      navigate('/');
    }
  };

  return {
    isAuthenticated: !!user,
    currentUser: userProfile,
    user,
    session,
    isLoading: !isMounted,
    logout,
    hasRole: (role: UserRole) => {
      if (!userProfile) return false;
      return userProfile.role === role || userProfile.role === 'admin';
    },
    canAccess: (role: UserRole) => {
      if (!userProfile) return false;
      if (userProfile.role === 'admin') return true;
      if (userProfile.role === 'pm' && (role === 'client' || role === 'pm')) return true;
      return userProfile.role === role;
    }
  };
}