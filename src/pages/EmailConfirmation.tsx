
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
    const handleEmailConfirmation = async () => {
      try {
        // Let Supabase handle the confirmation automatically
        // The URL contains the necessary tokens that Supabase will process
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Failed to confirm email. The link may be invalid or expired.');
          return;
        }

        if (session?.user) {
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
        } else {
          // If no session yet, wait a moment for Supabase to process
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session?.user) {
                setStatus('success');
                setMessage('Email confirmed successfully! You are now logged in.');
                
                toast({
                  title: "Email Confirmed",
                  description: "Your account has been activated successfully!",
                });

                setTimeout(() => {
                  navigate('/dashboard', { replace: true });
                }, 2000);
              } else {
                setStatus('error');
                setMessage('Email confirmation failed. Please try signing up again.');
              }
            });
          }, 1000);
        }
      } catch (error: any) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

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
