
import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const { isPasswordRecovery, setIsPasswordRecovery, checkPasswordRecovery } = usePasswordRecovery();

  useEffect(() => {
    // Initial recovery check
    const isRecovery = checkPasswordRecovery();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Check current recovery state
        const currentRecoveryCheck = checkPasswordRecovery();
        
        // Set session and user
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle password recovery state
        if (event === 'PASSWORD_RECOVERY' || currentRecoveryCheck) {
          setIsPasswordRecovery(true);
          // Don't fetch profile during password recovery
          setProfile(null);
        } else if (session?.user && !currentRecoveryCheck && window.location.pathname !== '/set-password') {
          setIsPasswordRecovery(false);
          // Fetch profile for regular sessions
          setTimeout(async () => {
            const profileData = await authService.fetchProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else if (!session?.user) {
          setProfile(null);
          // Only clear password recovery if not on set-password page
          if (window.location.pathname !== '/set-password') {
            setIsPasswordRecovery(false);
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Always set session and user from existing session check
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkPasswordRecovery, setIsPasswordRecovery]);

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
