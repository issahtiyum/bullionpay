import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeText, validateInput } from '@/utils/sanitizer';
import { useSecureState } from '@/hooks/useSecureStorage';

type LocationState = {
  from?: {
    pathname: string;
  };
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [isSignUp, setIsSignUp] = useState(initialTab === 'signup');
  const [isEmailConfirmationSent, setIsEmailConfirmationSent] = useState(false);
  const [contactValue, setContactValue] = useSecureState('login_contact', '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    signUp, 
    signInWithEmail 
  } = useAuth();
  
  const from = (location.state as LocationState)?.from?.pathname || "/all-products";
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const resetForm = () => {
    setContactValue('');
    setIsEmailConfirmationSent(false);
  };

  const handleTabChange = (value: string) => {
    setIsSignUp(value === 'signup');
    resetForm();
  };
  
  const handleLoginSubmit = async (contactMethod: 'email', contactValue: string, password: string) => {
    // Sanitize inputs
    const sanitizedContact = sanitizeText(contactValue.trim());
    const sanitizedPassword = sanitizeText(password);

    if (!sanitizedPassword || sanitizedPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Please enter your password (minimum 6 characters)",
        variant: "destructive",
      });
      return;
    }

    if (!validateInput.email(sanitizedContact)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setContactValue(sanitizedContact);
    
    try {
      const result = await signInWithEmail(sanitizedContact, sanitizedPassword);
      if (!result.error) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate(from, { replace: true });
      } else {
        toast({
          title: "Authentication Error",
          description: result.error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (
    contactMethod: 'email', 
    contactValue: string, 
    firstName: string, 
    lastName: string, 
    password: string
  ) => {
    // Sanitize inputs
    const sanitizedContact = sanitizeText(contactValue.trim());
    const sanitizedFirstName = sanitizeText(firstName.trim());
    const sanitizedLastName = sanitizeText(lastName.trim());
    const sanitizedPassword = sanitizeText(password);

    if (!validateInput.name(sanitizedFirstName) || !validateInput.name(sanitizedLastName)) {
      toast({
        title: "Invalid name",
        description: "Please enter valid first and last names (1-100 characters)",
        variant: "destructive",
      });
      return;
    }

    if (!validateInput.email(sanitizedContact)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setContactValue(sanitizedContact);
    
    try {
      const result = await signUp(sanitizedContact, sanitizedPassword, sanitizedFirstName, sanitizedLastName);
      if (!result.error) {
        setIsEmailConfirmationSent(true);
        toast({
          title: "Check your email",
          description: "A confirmation link has been sent to your email address. Click the link to activate your account.",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: result.error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-bullion-purple-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              {from.includes('/checkout') ? "Complete Your Purchase" : "Welcome to BullionPay"}
            </CardTitle>
            <CardDescription>
              {from.includes('/checkout') 
                ? "Please sign in or create an account to complete your purchase"
                : isEmailConfirmationSent
                  ? "Check your email and click the confirmation link to activate your account"
                  : "Sign in to your account or create a new one"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEmailConfirmationSent ? (
              <Tabs value={isSignUp ? 'signup' : 'login'} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 mt-4">
                  <LoginForm onSubmit={handleLoginSubmit} loading={loading} />
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      New to BullionPay?{' '}
                      <button
                        type="button"
                        onClick={() => handleTabChange('signup')}
                        className="font-poppins font-semibold text-bullion-purple hover:text-bullion-purple-800 hover:underline transition-colors"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <SignupForm onSubmit={handleSignupSubmit} loading={loading} />
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleTabChange('login')}
                        className="font-poppins font-semibold text-bullion-purple hover:text-bullion-purple-800 hover:underline transition-colors"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation link to <strong>{contactValue}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to activate your account and sign in automatically.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Don't see the email? Check your spam folder or try signing up again.
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;
