
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import LoginHeader from './LoginHeader';
import LoginTabs from './LoginTabs';
import GoogleSignInButton from './GoogleSignInButton';
import EmailConfirmationMessage from './EmailConfirmationMessage';
import OtpVerificationForm from './OtpVerificationForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

type LocationState = {
  from?: {
    pathname: string;
  };
};

type ContactMethod = 'email' | 'phone';

const LoginContainer = () => {
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

  return (
    <Card className="border-bullion-purple-100">
      <LoginHeader 
        from={from}
        showResetPassword={showResetPassword}
        showForgotPassword={showForgotPassword}
        isResetLinkSent={isResetLinkSent}
        isEmailConfirmationSent={isEmailConfirmationSent}
        isOtpSent={isOtpSent}
        contactMethod={contactMethod}
      />
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
            <LoginTabs
              isSignUp={isSignUp}
              onTabChange={handleTabChange}
              onLoginSubmit={handleLoginSubmit}
              onSignupSubmit={handleSignupSubmit}
              onForgotPassword={handleForgotPassword}
              loading={loading}
            />
            <GoogleSignInButton />
          </>
        ) : isEmailConfirmationSent ? (
          <EmailConfirmationMessage
            contactValue={contactValue}
            onBack={resetForm}
          />
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
  );
};

export default LoginContainer;
