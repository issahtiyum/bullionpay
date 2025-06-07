
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import SetNewPasswordForm from '@/components/auth/SetNewPasswordForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, isAuthenticated } = useAuth();

  // Step 2: Ensure /set-password route handles the reset flow properly
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  console.log('SetPassword page loaded with params:', {
    accessToken: accessToken ? 'present' : 'missing',
    refreshToken: refreshToken ? 'present' : 'missing',
    type,
    allParams: Object.fromEntries(searchParams.entries())
  });

  useEffect(() => {
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

    // Log that we have the necessary tokens
    console.log('Password reset tokens found, ready for password update');
  }, [accessToken, refreshToken, navigate, toast]);

  useEffect(() => {
    // Step 3: Prevent auto-redirects to dashboard from interfering on /set-password
    // Only redirect to dashboard after successful password update, not just because user is authenticated
    if (isAuthenticated && !accessToken && !refreshToken) {
      console.log('User is authenticated but no reset tokens, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, accessToken, refreshToken]);

  const handlePasswordUpdate = async (password: string) => {
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
        // Now redirect to dashboard after successful password update
        navigate('/dashboard');
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

  // Don't render the form if we don't have the necessary tokens
  if (!accessToken || !refreshToken) {
    return null;
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
