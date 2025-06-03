import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type LocationState = {
  from?: {
    pathname: string;
  };
};

type ContactMethod = 'email' | 'phone';

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [isSignUp, setIsSignUp] = useState(initialTab === 'signup');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [contactValue, setContactValue] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailConfirmationSent, setIsEmailConfirmationSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLinkSent, setIsResetLinkSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    signUp, 
    signUpWithPhone, 
    signInWithEmail, 
    signInWithPhone, 
    verifyOtp,
    resetPassword,
    updatePassword
  } = useAuth();
  
  const from = (location.state as LocationState)?.from?.pathname || "/dashboard";
  
  useEffect(() => {
    // Check if user arrived from password reset email
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    console.log('URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
    
    if (accessToken && refreshToken && type === 'recovery') {
      console.log('Password reset link detected, showing reset form');
      setShowResetPassword(true);
      return;
    }
    
    if (isAuthenticated && !showResetPassword) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, searchParams, showResetPassword]);

  const resetForm = () => {
    setContactValue('');
    setIsOtpSent(false);
    setIsEmailConfirmationSent(false);
    setShowForgotPassword(false);
    setIsResetLinkSent(false);
    setShowResetPassword(false);
  };

  const handleTabChange = (value: string) => {
    setIsSignUp(value === 'signup');
    resetForm();
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setIsResetLinkSent(false);
  };

  const handleUpdatePassword = async (newPassword: string) => {
    if (newPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated",
        });
        setShowResetPassword(false);
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(from, { replace: true });
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
  
  const handleLoginSubmit = async (contactMethod: ContactMethod, contactValue: string, password?: string) => {
    if (contactMethod === 'email' && (!password || password.length < 6)) {
      toast({
        title: "Invalid password",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    if (!contactValue || (contactMethod === 'email' ? !contactValue.includes('@') : contactValue.length < 10)) {
      toast({
        title: `Invalid ${contactMethod}`,
        description: `Please enter a valid ${contactMethod}`,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setContactMethod(contactMethod);
    setContactValue(contactValue);
    
    try {
      let result;
      
      if (contactMethod === 'email') {
        result = await signInWithEmail(contactValue, password!);
        if (!result.error) {
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          navigate(from, { replace: true });
        }
      } else {
        result = await signInWithPhone(contactValue);
        if (!result.error) {
          setIsOtpSent(true);
          toast({
            title: "OTP Sent",
            description: "A verification code has been sent to your phone",
          });
        }
      }
      
      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        });
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

  const handleSignupSubmit = async (
    contactMethod: ContactMethod, 
    contactValue: string, 
    firstName: string, 
    lastName: string, 
    password?: string
  ) => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your first and last name",
        variant: "destructive",
      });
      return;
    }

    if (!contactValue || (contactMethod === 'email' ? !contactValue.includes('@') : contactValue.length < 10)) {
      toast({
        title: `Invalid ${contactMethod}`,
        description: `Please enter a valid ${contactMethod}`,
        variant: "destructive",
      });
      return;
    }

    if (contactMethod === 'email' && (!password || password.length < 6)) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setContactMethod(contactMethod);
    setContactValue(contactValue);
    
    try {
      let result;
      
      if (contactMethod === 'email') {
        result = await signUp(contactValue, password!, firstName, lastName);
        if (!result.error) {
          setIsEmailConfirmationSent(true);
          toast({
            title: "Check your email",
            description: "A confirmation link has been sent to your email address",
          });
        }
      } else {
        result = await signUpWithPhone(contactValue, firstName, lastName);
        if (!result.error) {
          setIsOtpSent(true);
          toast({
            title: "OTP Sent",
            description: "A verification code has been sent to your phone",
          });
        }
      }
      
      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        });
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

  const handleResetPasswordSubmit = async (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } else {
        setIsResetLinkSent(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link",
        });
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
  
  const handleVerifyOtp = async (otp: string) => {
    if (!otp || otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await verifyOtp(otp, 'sms', contactValue);
      
      if (error) {
        toast({
          title: "Verification failed",
          description: error.message || "Invalid verification code",
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Account created successfully" : "Login successful",
          description: `Welcome! You have been ${isSignUp ? 'registered' : 'logged in'} successfully`,
        });
        navigate(from, { replace: true });
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

  const getCardTitle = () => {
    if (from.includes('/checkout')) return "Complete Your Purchase";
    if (showResetPassword) return "Set New Password";
    if (showForgotPassword) return "Reset Your Password";
    return "Welcome to BullionPay";
  };

  const getCardDescription = () => {
    if (from.includes('/checkout')) {
      return "Please sign in or create an account to complete your purchase";
    }
    if (showResetPassword) {
      return "Enter your new password below";
    }
    if (showForgotPassword) {
      return isResetLinkSent 
        ? "We've sent a password reset link to your email" 
        : "Enter your email address to receive a password reset link";
    }
    if (isEmailConfirmationSent) {
      return "Check your email for a confirmation link to complete your account setup";
    }
    if (isOtpSent) {
      return `Enter the 6-digit verification code sent to your ${contactMethod}`;
    }
    return "Sign in to your account or create a new one";
  };
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-bullion-purple-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              {getCardTitle()}
            </CardTitle>
            <CardDescription>
              {getCardDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetPassword ? (
              <ResetPasswordForm
                onSubmit={handleUpdatePassword}
                loading={loading}
              />
            ) : showForgotPassword ? (
              <ForgotPasswordForm
                onSubmit={handleResetPasswordSubmit}
                onBack={handleBackToLogin}
                loading={loading}
              />
            ) : !isOtpSent && !isEmailConfirmationSent ? (
              <>
                <Tabs value={isSignUp ? 'signup' : 'login'} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <LoginForm 
                      onSubmit={handleLoginSubmit} 
                      onForgotPassword={handleForgotPassword}
                      loading={loading} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <SignupForm onSubmit={handleSignupSubmit} loading={loading} />
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Coming soon</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 border-bullion-purple-200 hover:bg-bullion-purple-50"
                    disabled
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </>
            ) : isEmailConfirmationSent ? (
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation link to <strong>{contactValue}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to complete your account setup and sign in.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-bullion-purple hover:text-bullion-purple-800"
                  onClick={resetForm}
                >
                  Back to Sign Up
                </Button>
              </div>
            ) : (
              <OtpVerificationForm
                contactMethod={contactMethod}
                isSignUp={isSignUp}
                onVerify={handleVerifyOtp}
                onChangeContact={() => setIsOtpSent(false)}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;
