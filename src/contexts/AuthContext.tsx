
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';
import { usePasswordRecovery } from '@/hooks/usePasswordRecovery';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  signUp: async () => ({ error: null }),
  signInWithEmail: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  logout: async () => {},
  isAuthenticated: false,
  loading: true,
  isPasswordRecovery: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { isPasswordRecovery, setIsPasswordRecovery, checkPasswordRecovery } = usePasswordRecovery();

  // Memoize the password recovery check to prevent unnecessary re-renders
  const memoizedCheckPasswordRecovery = useCallback(checkPasswordRecovery, []);

  // Stable function to fetch profile data
  const fetchProfileData = useCallback(async (userId: string) => {
    try {
      const profileData = await authService.fetchProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Check initial password recovery state
    const isRecovery = memoizedCheckPasswordRecovery();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        const currentRecoveryCheck = memoizedCheckPasswordRecovery();
        
        // Update session and user synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle password recovery state
        if (event === 'PASSWORD_RECOVERY' || currentRecoveryCheck) {
          setIsPasswordRecovery(true);
          setProfile(null);
        } else if (session?.user && !currentRecoveryCheck && window.location.pathname !== '/set-password') {
          setIsPasswordRecovery(false);
          // Fetch profile data without blocking the auth state update
          fetchProfileData(session.user.id);
        } else if (!session?.user) {
          setProfile(null);
          if (window.location.pathname !== '/set-password') {
            setIsPasswordRecovery(false);
          }
        }
        
        // Only set loading to false after initial load is complete
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
          setLoading(false);
        }
      }
    );

    // Get initial session - only do this once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !memoizedCheckPasswordRecovery() && window.location.pathname !== '/set-password') {
        fetchProfileData(session.user.id);
      }
      
      // Complete initial load
      setInitialLoadComplete(true);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [memoizedCheckPasswordRecovery, setIsPasswordRecovery, fetchProfileData]);

  return (
    <AuthContext.Provider value={{ 
      user,
      profile,
      session,
      signUp: authService.signUp,
      signInWithEmail: authService.signInWithEmail,
      resetPassword: authService.resetPassword,
      updatePassword: authService.updatePassword,
      logout: authService.logout,
      isAuthenticated: !!user,
      loading,
      isPasswordRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
