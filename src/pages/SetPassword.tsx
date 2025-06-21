
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import SetNewPasswordForm from '@/components/auth/SetNewPasswordForm';
import PasswordResetTokenHandler from '@/components/auth/PasswordResetTokenHandler';
import PasswordResetDebugInfo from '@/components/auth/PasswordResetDebugInfo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type TokenInfo = {
  accessToken: string | null;
  refreshToken: string | null;
  type: string | null;
};

const SetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword, isAuthenticated, isPasswordRecovery, loading: authLoading } = useAuth();

  console.log('🔍 SetPassword: ===== COMPONENT MOUNT/RENDER =====');
  console.log('🔍 SetPassword: Component state:', {
    loading,
    sessionEstablished,
    tokens,
    isAuthenticated,
    isPasswordRecovery,
    authLoading,
    recoveryFlag: sessionStorage.getItem('supabase-recovery-session'),
    currentUrl: window.location.href
  });

  // Handle successful token establishment
  const handleTokensEstablished = (tokenInfo: TokenInfo) => {
    console.log('🔍 SetPassword: ✅ TOKENS ESTABLISHED SUCCESSFULLY');
    console.log('🔍 SetPassword: Token info:', tokenInfo);
    setTokens(tokenInfo);
    setSessionEstablished(true);
    
    // Ensure recovery flag is set
    sessionStorage.setItem('supabase-recovery-session', 'true');
  };

  // Handle invalid tokens
  const handleTokensInvalid = () => {
    console.log('🔍 SetPassword: ❌ INVALID TOKENS DETECTED');
    setTokens(null);
    setSessionEstablished(false);
  };

  // Redirect logic - be very careful about when to redirect
  useEffect(() => {
    console.log('🔍 SetPassword: REDIRECT CHECK EFFECT');
    
    // Don't redirect if auth is still loading
    if (authLoading) {
      console.log('🔍 SetPassword: Auth still loading, not redirecting');
      return;
    }
    
    // Check for recovery indicators
    const hasRecoveryFlag = sessionStorage.getItem('supabase-recovery-session');
    const hasTokensInUrl = window.location.search.includes('access_token') || window.location.hash.includes('access_token');
    
    console.log('🔍 SetPassword: Redirect check details:', {
      isAuthenticated,
      isPasswordRecovery,
      hasRecoveryFlag,
      hasTokensInUrl,
      sessionEstablished,
      tokens: !!tokens
    });
    
    // Only redirect if user is authenticated but NOT in password recovery mode
    if (isAuthenticated && !isPasswordRecovery && !hasRecoveryFlag && !hasTokensInUrl && !sessionEstablished && !tokens) {
      console.log('🔍 SetPassword: 🚀 REDIRECTING TO DASHBOARD - Regular authenticated user');
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate, isPasswordRecovery, sessionEstablished, tokens]);

  const handlePasswordUpdate = async (password: string) => {
    console.log('🔍 SetPassword: 🔄 PASSWORD UPDATE INITIATED');
    
    if (!sessionEstablished && !isAuthenticated) {
      console.log('🔍 SetPassword: ❌ Session not established, showing error');
      toast({
        title: "Session error",
        description: "Please try clicking the reset link again",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 SetPassword: Calling updatePassword...');
      const { error } = await updatePassword(password);

      if (error) {
        console.log('🔍 SetPassword: ❌ Password update failed:', error);
        toast({
          title: "Update failed",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
      } else {
        console.log('🔍 SetPassword: ✅ Password updated successfully');
        // Clear recovery flag
        sessionStorage.removeItem('supabase-recovery-session');
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully",
        });
        console.log('🔍 SetPassword: Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.log('🔍 SetPassword: ❌ Exception during password update:', error);
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
        <div className="max-w-md mx-auto space-y-4">
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

  // Determine if we should show the form
  const hasRecoveryFlag = sessionStorage.getItem('supabase-recovery-session');
  const hasTokensInUrl = window.location.search.includes('access_token') || window.location.hash.includes('access_token');
  const canShowForm = sessionEstablished || (isAuthenticated && (isPasswordRecovery || hasRecoveryFlag)) || hasTokensInUrl;

  console.log('🔍 SetPassword: Form display logic:', {
    canShowForm,
    sessionEstablished,
    isAuthenticated,
    isPasswordRecovery,
    hasRecoveryFlag,
    hasTokensInUrl
  });

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-4">
        {/* Token Handler Component - always present to handle tokens */}
        <PasswordResetTokenHandler 
          onTokensEstablished={handleTokensEstablished}
          onTokensInvalid={handleTokensInvalid}
        />

        <Card className="border-bullion-purple-100">
          {!canShowForm ? (
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Processing reset link...</p>
                <PasswordResetDebugInfo 
                  tokens={tokens}
                  sessionEstablished={sessionEstablished}
                  isPasswordRecovery={isPasswordRecovery}
                />
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
                <SetNewPasswordForm onSubmit={handlePasswordUpdate} loading={loading} />
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default SetPassword;
