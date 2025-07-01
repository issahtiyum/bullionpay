
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailConfirmation = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let mounted = true;

    const handleEmailConfirmation = () => {
      console.log('Setting up email confirmation listener');
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change in email confirmation:', event, session?.user?.email);
          
          if (!mounted) return;

          if (event === 'SIGNED_IN' && session?.user) {
            // Email confirmation successful
            setStatus('success');
            setMessage('Email confirmed successfully! You are now logged in.');
            
            toast({
              title: "Email Confirmed",
              description: "Your account has been activated successfully!",
            });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              if (mounted) {
                navigate('/dashboard', { replace: true });
              }
            }, 2000);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Sometimes confirmation comes through as token refresh
            setStatus('success');
            setMessage('Email confirmed successfully! You are now logged in.');
            
            toast({
              title: "Email Confirmed",
              description: "Your account has been activated successfully!",
            });

            setTimeout(() => {
              if (mounted) {
                navigate('/dashboard', { replace: true });
              }
            }, 2000);
          }
        }
      );

      // Set a timeout to show error if no confirmation happens within 10 seconds
      timeoutId = setTimeout(() => {
        if (mounted && status === 'loading') {
          setStatus('error');
          setMessage('Email confirmation failed. The link may be invalid or expired.');
        }
      }, 10000);

      return subscription;
    };

    const subscription = handleEmailConfirmation();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [navigate, toast, status]);

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
              {status === 'loading' && 'Please wait while we confirm your email address...'}
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
