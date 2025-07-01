
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  signUp: async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // Use the email confirmation page as the redirect URL
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
      console.log('Attempting signup with redirect URL:', redirectUrl);
      
      const { error, data } = await supabase.auth.signUp({
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
      
      if (error) {
        console.error('Signup error:', error);
      } else {
        console.log('Signup successful, confirmation email sent');
      }
      
      return { error, data };
    } catch (error: any) {
      console.error('Signup exception:', error);
      return { error: { message: error.message || 'Signup failed' } };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      }
      
      return { error, data };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { error: { message: error.message || 'Sign in failed' } };
    }
  },

  resetPassword: async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/set-password`;
      
      console.log('Sending password reset with redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
      }
      
      return { error };
    } catch (error: any) {
      console.error('Password reset exception:', error);
      return { error: { message: error.message || 'Password reset failed' } };
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        console.error('Password update error:', error);
      }
      
      return { error };
    } catch (error: any) {
      console.error('Password update exception:', error);
      return { error: { message: error.message || 'Password update failed' } };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is acceptable
        console.error('Profile fetch error:', error);
      }
      
      return profileData;
    } catch (error) {
      console.error('Profile fetch exception:', error);
      return null;
    }
  }
};
