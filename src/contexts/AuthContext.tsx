
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
    console.log('🔍 AuthProvider: STARTING - Setting up auth state listener');
    console.log('🔍 AuthProvider: Current URL at startup:', window.location.href);
    console.log('🔍 AuthProvider: Current pathname at startup:', window.location.pathname);
    
    // Initial recovery check
    const isRecovery = checkPasswordRecovery();
    console.log('🔍 AuthProvider: Initial recovery check result:', isRecovery);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 AuthProvider: ===== AUTH STATE CHANGE =====');
        console.log('🔍 AuthProvider: Event:', event);
        console.log('🔍 AuthProvider: Session exists:', !!session);
        console.log('🔍 AuthProvider: User email:', session?.user?.email);
        console.log('🔍 AuthProvider: Current URL during auth change:', window.location.href);
        console.log('🔍 AuthProvider: Current pathname during auth change:', window.location.pathname);
        
        // Check current recovery state
        const currentRecoveryCheck = checkPasswordRecovery();
        console.log('🔍 AuthProvider: Current recovery check during auth change:', currentRecoveryCheck);
        
        // Set session and user
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle password recovery state
        if (event === 'PASSWORD_RECOVERY' || currentRecoveryCheck) {
          console.log('🔍 AuthProvider: 🟢 PASSWORD RECOVERY STATE DETECTED');
          setIsPasswordRecovery(true);
          // Don't fetch profile during password recovery
          setProfile(null);
        } else if (session?.user && !currentRecoveryCheck && window.location.pathname !== '/set-password') {
          console.log('🔍 AuthProvider: 🟡 REGULAR USER SESSION, fetching profile...');
          setIsPasswordRecovery(false);
          // Fetch profile for regular sessions
          setTimeout(async () => {
            const profileData = await authService.fetchProfile(session.user.id);
            console.log('🔍 AuthProvider: Profile fetched:', profileData);
            setProfile(profileData);
          }, 0);
        } else if (!session?.user) {
          console.log('🔍 AuthProvider: 🔴 NO USER SESSION, clearing state');
          setProfile(null);
          // Only clear password recovery if not on set-password page
          if (window.location.pathname !== '/set-password') {
            setIsPasswordRecovery(false);
          }
        }
        
        setLoading(false);
        console.log('🔍 AuthProvider: ===== AUTH STATE CHANGE END =====');
      }
    );

    // Check for existing session
    console.log('🔍 AuthProvider: Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 AuthProvider: ===== EXISTING SESSION CHECK =====');
      console.log('🔍 AuthProvider: Existing session found:', !!session);
      console.log('🔍 AuthProvider: Existing user email:', session?.user?.email);
      
      // Always set session and user from existing session check
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      console.log('🔍 AuthProvider: ===== EXISTING SESSION CHECK END =====');
    });

    return () => {
      console.log('🔍 AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [checkPasswordRecovery, setIsPasswordRecovery]);

  console.log('🔍 AuthProvider: RENDER - Current state:', {
    hasUser: !!user,
    hasSession: !!session,
    isAuthenticated: !!user,
    loading,
    isPasswordRecovery,
    currentPath: window.location.pathname,
    recoveryFlag: sessionStorage.getItem('supabase-recovery-session')
  });

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
