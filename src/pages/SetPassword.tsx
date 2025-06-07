
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

  // Check if we have the necessary tokens from the email link
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    // If no tokens in URL, redirect to login
    if (!accessToken || !refreshToken) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  }, [accessToken, refreshToken, navigate, toast]);

  useEffect(() => {
    // If user is authenticated after password update, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

    try {
      const { error } = await updatePassword(password);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully",
        });
        // User will be automatically redirected by the useEffect above
      }
    } catch (error: any) {
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
