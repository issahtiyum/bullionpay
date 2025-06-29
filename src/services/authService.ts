
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  signUp: async (email: string, password: string, firstName?: string, lastName?: string) => {
    // Use the email confirmation page as the redirect URL
    const redirectUrl = `${window.location.origin}/email-confirmation`;
    
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
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
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
    
    return profileData;
  }
};
