
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  signUp: async (email: string, password: string, firstName?: string, lastName?: string) => {
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
  },

  signInWithEmail: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  },

  resetPassword: async (email: string) => {
    const redirectUrl = `${window.location.origin}/set-password`;
    
    console.log('🔍 AuthService: Sending password reset email:', {
      email,
      redirectUrl,
      currentOrigin: window.location.origin,
      fullUrl: window.location.href
    });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('❌ AuthService: Password reset error:', error);
    } else {
      console.log('✅ AuthService: Password reset email sent successfully');
      console.log('✅ AuthService: Email should redirect to:', redirectUrl);
    }
    
    return { error };
  },

  updatePassword: async (password: string) => {
    console.log('🔍 AuthService: Updating password...');
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) {
      console.error('❌ AuthService: Password update error:', error);
    } else {
      console.log('✅ AuthService: Password updated successfully');
    }
    
    return { error };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  fetchProfile: async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('🔍 AuthService: Profile data:', profileData);
    return profileData;
  }
};
