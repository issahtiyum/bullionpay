
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
  console.log('🔍 SetPassword: Component mounted/rendered');
  console.log('🔍 SetPassword: Current URL:', window.location.href);
  console.log('🔍 SetPassword: Current pathname:', window.location.pathname);
  console.log('🔍 SetPassword: Current search:', window.location.search);
  console.log('🔍 SetPassword: Current hash:', window.location.hash);
  console.log('🔍 SetPassword: IsPasswordRecovery from context:', isPasswordRecovery);
  console.log('🔍 SetPassword: IsAuthenticated from context:', isAuthenticated);
  console.log('🔍 SetPassword: AuthLoading from context:', authLoading);
  console.log('🔍 SetPassword: Tokens state:', tokens);
  console.log('🔍 SetPassword: SessionEstablished state:', sessionEstablished);
  console.log('🔍 SetPassword: Recovery flag in sessionStorage:', sessionStorage.getItem('supabase-recovery-session'));
  console.log('🔍 SetPassword: ===== COMPONENT MOUNT/RENDER END =====');

  // Handle successful token establishment
  const handleTokensEstablished = (tokenInfo: TokenInfo) => {
    console.log('🔍 SetPassword: ✅ TOKENS ESTABLISHED SUCCESSFULLY');
    console.log('🔍 SetPassword: Token info:', tokenInfo);
    setTokens(tokenInfo);
    setSessionEstablished(true);
  };

  // Handle invalid tokens
  const handleTokensInvalid = () => {
    console.log('🔍 SetPassword: ❌ INVALID TOKENS DETECTED');
    setTokens(null);
    setSessionEstablished(false);
  };

  // Redirect logic - only redirect if not in recovery mode and not processing tokens
  useEffect(() => {
    console.log('🔍 SetPassword: REDIRECT CHECK EFFECT');
    console.log('🔍 SetPassword: isAuthenticated:', isAuthenticated);
    console.log('🔍 SetPassword: authLoading:', authLoading);
    console.log('🔍 SetPassword: tokens:', tokens);
    console.log('🔍 SetPassword: isPasswordRecovery:', isPasswordRecovery);
    console.log('🔍 SetPassword: sessionEstablished:', sessionEstablished);
    console.log('🔍 SetPassword: recovery flag:', sessionStorage.getItem('supabase-recovery-session'));
    
    // Don't redirect if auth is still loading
    if (authLoading) {
      console.log('🔍 SetPassword: Auth still loading, skipping redirect check');
      return;
    }
    
    // Don't redirect if we have recovery indicators
    const hasRecoveryFlag = sessionStorage.getItem('supabase-recovery-session');
    if (tokens || isPasswordRecovery || sessionEstablished || hasRecoveryFlag) {
      console.log('🔍 SetPassword: In password recovery mode, not redirecting');
      return;
    }
    
    // Only redirect regular authenticated users who aren't in password recovery
    if (isAuthenticated && !isPasswordRecovery && !tokens && !hasRecoveryFlag) {
      console.log('🔍 SetPassword: 🚀 REDIRECTING TO DASHBOARD - Regular authenticated user');
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate, tokens, isPasswordRecovery, sessionEstablished]);

  const handlePasswordUpdate = async (password: string) => {
    console.log('🔍 SetPassword: 🔄 PASSWORD UPDATE INITIATED');
    console.log('🔍 SetPassword: Session established?', sessionEstablished);
    
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

  const hasRecoveryFlag = sessionStorage.getItem('supabase-recovery-session');
  const canShowForm = sessionEstablished || (isAuthenticated && (isPasswordRecovery || hasRecoveryFlag));

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-4">
        {/* Token Handler Component */}
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
