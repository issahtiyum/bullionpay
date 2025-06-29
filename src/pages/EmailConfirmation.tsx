
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Extract tokens from URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (!accessToken || !refreshToken || type !== 'signup') {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try signing up again.');
          return;
        }

        // Exchange tokens for session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to confirm email. Please try again.');
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! You are now logged in.');
          
          toast({
            title: "Email Confirmed",
            description: "Your account has been activated successfully!",
          });

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  const handleRetry = () => {
    navigate('/login?tab=signup', { replace: true });
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-bullion-purple-100">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <Loader2 className="h-12 w-12 text-bullion-purple animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
              {status === 'error' && (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl font-semibold">
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === 'success' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  You will be redirected to your dashboard shortly.
                </p>
                <Button
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-bullion hover:opacity-90"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-gradient-bullion hover:opacity-90"
                >
                  Try Signing Up Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EmailConfirmation;
