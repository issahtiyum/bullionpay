
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
  const { updatePassword, isAuthenticated, isPasswordRecovery } = useAuth();

  console.log('🔍 SetPassword component mounted');
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 IsPasswordRecovery:', isPasswordRecovery);

  // Handle successful token establishment
  const handleTokensEstablished = (tokenInfo: TokenInfo) => {
    console.log('✅ SetPassword: Tokens established successfully');
    setTokens(tokenInfo);
    setSessionEstablished(true);
  };

  // Handle invalid tokens
  const handleTokensInvalid = () => {
    console.log('❌ SetPassword: Invalid tokens detected');
    setTokens(null);
    setSessionEstablished(false);
  };

  // Redirect authenticated users who aren't in password recovery
  useEffect(() => {
    if (isAuthenticated && !tokens && !isPasswordRecovery) {
      console.log('🔍 SetPassword: Regular authenticated user, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, tokens, isPasswordRecovery]);

  const handlePasswordUpdate = async (password: string) => {
    console.log('🔍 SetPassword: Password update initiated');
    
    if (!sessionEstablished) {
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
        window.history.replaceState({}, document.title, '/dashboard');
        navigate('/dashboard', { replace: true });
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

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-4">
        {/* Token Handler Component */}
        <PasswordResetTokenHandler 
          onTokensEstablished={handleTokensEstablished}
          onTokensInvalid={handleTokensInvalid}
        />

        <Card className="border-bullion-purple-100">
          {!tokens || !sessionEstablished ? (
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
