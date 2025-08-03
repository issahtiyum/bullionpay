
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import SecurePasswordField from '@/components/auth/SecurePasswordField';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [canShowForm, setCanShowForm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check if user has a valid session for password reset
    const checkSession = async () => {
      if (authLoading) return;
      
      if (isAuthenticated) {
        setCanShowForm(true);
      } else {
        // If not authenticated, redirect to password reset
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/reset-password');
      }
    };

    checkSession();
  }, [isAuthenticated, authLoading, navigate, toast]);

  const validatePasswords = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswords()) {
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Session error",
        description: "Please try clicking the reset link again",
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
        navigate('/all-products', { replace: true });
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

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto">
          <Card className="border-bullion-purple-100">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Loading...</p>
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
          {!canShowForm ? (
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Redirecting...</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Set New Password</CardTitle>
                <CardDescription>
                  Choose a strong password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handlePasswordUpdate(); }} className="space-y-4">
                  <SecurePasswordField
                    label="New Password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    placeholder="Enter your new password"
                    required
                    showStrengthIndicator
                  />
                  
                  <SecurePasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    error={errors.confirmPassword}
                    placeholder="Confirm your new password"
                    required
                  />
                  
                  <Button 
                    type="submit"
                    className="w-full bg-bullion-purple hover:bg-bullion-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default SetPassword;
