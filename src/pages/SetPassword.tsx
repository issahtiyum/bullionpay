
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import SetNewPasswordForm from '@/components/auth/SetNewPasswordForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, isAuthenticated } = useAuth();

  // Helper function to parse tokens from URL
  const parseTokensFromUrl = () => {
    // Check URL search parameters first
    const searchParams = new URLSearchParams(window.location.search);
    let accessToken = searchParams.get('access_token');
    let refreshToken = searchParams.get('refresh_token');
    let type = searchParams.get('type');

    // If not found in search params, check URL fragment (hash)
    if (!accessToken || !refreshToken) {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      const hashParams = new URLSearchParams(hash);
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      type = hashParams.get('type');
    }

    console.log('Token parsing results:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      type,
      fullUrl: window.location.href,
      search: window.location.search,
      hash: window.location.hash
    });

    return { accessToken, refreshToken, type };
  };

  useEffect(() => {
    const establishSession = async () => {
      const { accessToken, refreshToken, type } = parseTokensFromUrl();

      // If no tokens in URL, redirect to login
      if (!accessToken || !refreshToken) {
        console.log('Missing tokens, redirecting to login');
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Store tokens for later use
      setTokens({ accessToken, refreshToken });

      try {
        console.log('Attempting to establish session with tokens...');
        
        // Set the session using the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Failed to establish session:', error);
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired",
            variant: "destructive",
          });
          navigate('/login');
        } else {
          console.log('Session established successfully:', data);
          setSessionEstablished(true);
        }
      } catch (error) {
        console.error('Error establishing session:', error);
        toast({
          title: "Error",
          description: "Failed to process reset link",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    establishSession();
  }, [navigate, toast]);

  // Only redirect to dashboard if user is authenticated AND we don't have reset tokens
  // This prevents redirecting during the password reset flow
  useEffect(() => {
    if (isAuthenticated && !tokens) {
      console.log('User is authenticated but no reset tokens, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, tokens]);

  const handlePasswordUpdate = async (password: string) => {
    if (!sessionEstablished) {
      toast({
        title: "Session error",
        description: "Please try clicking the reset link again",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Attempting to update password...');

    try {
      const { error } = await updatePassword(password);

      if (error) {
        console.error('Password update failed:', error);
        toast({
          title: "Update failed",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
      } else {
        console.log('Password updated successfully');
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully",
        });
        // Clear the URL params and redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form if we don't have the necessary tokens or session isn't established
  if (!tokens || !sessionEstablished) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto">
          <Card className="border-bullion-purple-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground">Processing reset link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-bullion-purple-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Set New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetNewPasswordForm onSubmit={handlePasswordUpdate} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SetPassword;
