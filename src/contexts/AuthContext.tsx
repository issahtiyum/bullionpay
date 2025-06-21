
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
    console.log('🔍 AuthProvider: Setting up auth state listener');
    
    // Initial check
    const isRecovery = checkPasswordRecovery();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 AuthProvider: Auth state change detected:', {
          event,
          user: session?.user?.email,
          hasSession: !!session,
          isPasswordRecovery: isRecovery || event === 'PASSWORD_RECOVERY'
        });
        
        // Update password recovery state based on event
        if (event === 'PASSWORD_RECOVERY' || isRecovery) {
          console.log('🔍 AuthProvider: Password recovery state detected');
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_IN' && !isRecovery && window.location.pathname !== '/set-password') {
          console.log('🔍 AuthProvider: Regular sign in detected');
          setIsPasswordRecovery(false);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isRecovery && event !== 'PASSWORD_RECOVERY' && window.location.pathname !== '/set-password') {
          console.log('🔍 AuthProvider: User session found, fetching profile...');
          // Fetch user profile
          setTimeout(async () => {
            const profileData = await authService.fetchProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else if (!session?.user) {
          console.log('🔍 AuthProvider: No user session, clearing profile');
          setProfile(null);
          if (window.location.pathname !== '/set-password') {
            setIsPasswordRecovery(false);
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('🔍 AuthProvider: Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 AuthProvider: Existing session check result:', {
        hasSession: !!session,
        user: session?.user?.email,
        isPasswordRecovery: isRecovery
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
