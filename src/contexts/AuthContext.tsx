
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';

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
    
    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.log('Session initialization error:', error.message);
          // Don't throw - just log and continue
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfileData(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        // Update session and user
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle profile fetching for authenticated users
        if (session?.user) {
          // Use setTimeout to avoid blocking auth state changes
          setTimeout(() => {
            if (mounted) {
              fetchProfileData(session.user.id);
            }
          }, 100);
        } else {
          setProfile(null);
        }
        
        // Set loading to false after auth state is processed
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileData, loading]);

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
      isPasswordRecovery: false,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
