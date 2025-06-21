
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, isAuthenticated } = useAuth();

  console.log('🔍 SetPassword component mounted');
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 Current route should be /set-password');

  // Helper function to parse tokens from URL
  const parseTokensFromUrl = () => {
    console.log('🔍 Starting token parsing...');
    
    // Check URL search parameters first
    const searchParams = new URLSearchParams(window.location.search);
    let accessToken = searchParams.get('access_token');
    let refreshToken = searchParams.get('refresh_token');
    let type = searchParams.get('type');

    console.log('🔍 Search params check:', {
      accessToken: accessToken ? 'FOUND' : 'NOT FOUND',
      refreshToken: refreshToken ? 'FOUND' : 'NOT FOUND',
      type,
      allSearchParams: Object.fromEntries(searchParams.entries())
    });

    // If not found in search params, check URL fragment (hash)
    if (!accessToken || !refreshToken) {
      console.log('🔍 Tokens not found in search params, checking hash...');
      const hash = window.location.hash.substring(1); // Remove the # symbol
      console.log('🔍 Hash content:', hash);
      
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        type = hashParams.get('type');
        
        console.log('🔍 Hash params check:', {
          accessToken: accessToken ? 'FOUND' : 'NOT FOUND',
          refreshToken: refreshToken ? 'FOUND' : 'NOT FOUND',
          type,
          allHashParams: Object.fromEntries(hashParams.entries())
        });
      } else {
        console.log('🔍 No hash found in URL');
      }
    }

    const result = {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      type,
      fullUrl: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      pathname: window.location.pathname
    };

    console.log('🔍 Final token parsing results:', result);

    // Set debug info for display
    setDebugInfo(JSON.stringify(result, null, 2));

    return { accessToken, refreshToken, type };
  };

  useEffect(() => {
    console.log('🔍 SetPassword useEffect triggered');
    
    const establishSession = async () => {
      console.log('🔍 Starting session establishment...');
      const { accessToken, refreshToken, type } = parseTokensFromUrl();

      // If no tokens in URL, redirect to login
      if (!accessToken || !refreshToken) {
        console.log('❌ Missing tokens, redirecting to login');
        console.log('❌ This means the password reset email link was not clicked or is malformed');
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      console.log('✅ Tokens found, storing them...');
      // Store tokens for later use
      setTokens({ accessToken, refreshToken });

      try {
        console.log('🔍 Attempting to establish session with Supabase...');
        
        // Set the session using the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('❌ Failed to establish session:', error);
          console.error('❌ Error details:', {
            message: error.message,
            name: error.name,
            status: error.status
          });
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired",
            variant: "destructive",
          });
          navigate('/login');
        } else {
          console.log('✅ Session established successfully');
          console.log('✅ Session data:', {
            user: data.session?.user?.email,
            accessToken: data.session?.access_token ? 'present' : 'missing',
            refreshToken: data.session?.refresh_token ? 'present' : 'missing'
          });
          setSessionEstablished(true);
        }
      } catch (error) {
        console.error('❌ Exception during session establishment:', error);
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
    console.log('🔍 Auth redirect check:', {
      isAuthenticated,
      hasTokens: !!tokens,
      shouldRedirect: isAuthenticated && !tokens
    });
    
    if (isAuthenticated && !tokens) {
      console.log('🔍 User is authenticated but no reset tokens, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, tokens]);

  const handlePasswordUpdate = async (password: string) => {
    console.log('🔍 Password update initiated');
    
    if (!sessionEstablished) {
      console.log('❌ Session not established, cannot update password');
      toast({
        title: "Session error",
        description: "Please try clicking the reset link again",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('🔍 Attempting to update password...');

    try {
      const { error } = await updatePassword(password);

      if (error) {
        console.error('❌ Password update failed:', error);
        toast({
          title: "Update failed",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
      } else {
        console.log('✅ Password updated successfully');
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully",
        });
        // Clear the URL params and redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('❌ Password update error:', error);
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
        <div className="max-w-md mx-auto space-y-4">
          <Card className="border-bullion-purple-100">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Processing reset link...</p>
                
                {/* Debug information */}
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-semibold mb-2">Debug Information:</h3>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {debugInfo || 'Loading...'}
                  </pre>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Expected:</strong> You should be on /set-password with tokens in the URL</p>
                    <p><strong>Current path:</strong> {window.location.pathname}</p>
                    <p><strong>Has tokens:</strong> {tokens ? 'Yes' : 'No'}</p>
                    <p><strong>Session established:</strong> {sessionEstablished ? 'Yes' : 'No'}</p>
                  </div>
                </div>
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
