
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
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    signUp, 
    signInWithEmail 
  } = useAuth();
  
  const from = (location.state as LocationState)?.from?.pathname || "/dashboard";
  
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
    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    if (!contactValue || !contactValue.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setContactValue(contactValue);
    
    try {
      const result = await signInWithEmail(contactValue, password);
      if (!result.error) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate(from, { replace: true });
      } else {
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
    contactMethod: 'email', 
    contactValue: string, 
    firstName: string, 
    lastName: string, 
    password: string
  ) => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your first and last name",
        variant: "destructive",
      });
      return;
    }

    if (!contactValue || !contactValue.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setContactValue(contactValue);
    
    try {
      const result = await signUp(contactValue, password, firstName, lastName);
      if (!result.error) {
        setIsEmailConfirmationSent(true);
        toast({
          title: "Check your email",
          description: "A confirmation link has been sent to your email address",
        });
      } else {
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
                  ? "Check your email for a confirmation link to complete your account setup"
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
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <SignupForm onSubmit={handleSignupSubmit} loading={loading} />
                </TabsContent>
              </Tabs>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;
