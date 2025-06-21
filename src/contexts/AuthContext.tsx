
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  isPasswordRecovery: boolean;
};

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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    console.log('🔍 AuthProvider: Setting up auth state listener');
    
    // Enhanced password recovery detection
    const checkPasswordRecovery = () => {
      const url = window.location.href;
      const hasRecoveryTokens = (
        (url.includes('access_token') && url.includes('refresh_token')) ||
        (url.includes('type=recovery')) ||
        window.location.pathname === '/set-password'
      );
      
      console.log('🔍 AuthProvider: Enhanced password recovery check:', { 
        hasRecoveryTokens, 
        currentUrl: url,
        pathname: window.location.pathname
      });
      
      setIsPasswordRecovery(hasRecoveryTokens);
      return hasRecoveryTokens;
    };

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
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            console.log('🔍 AuthProvider: Profile data:', profileData);
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
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    
    return { error };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/set-password`;
    
    console.log('🔍 AuthProvider: Sending password reset email:', {
      email,
      redirectUrl,
      currentOrigin: window.location.origin
    });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('❌ AuthProvider: Password reset error:', error);
    } else {
      console.log('✅ AuthProvider: Password reset email sent successfully');
      console.log('✅ AuthProvider: User should check their email and click the link to go to /set-password');
    }
    
    return { error };
  };

  const updatePassword = async (password: string) => {
    console.log('🔍 AuthProvider: Updating password...');
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) {
      console.error('❌ AuthProvider: Password update error:', error);
    } else {
      console.log('✅ AuthProvider: Password updated successfully');
    }
    
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      profile,
      session,
      signUp,
      signInWithEmail,
      resetPassword,
      updatePassword,
      logout,
      isAuthenticated: !!user,
      loading,
      isPasswordRecovery,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
