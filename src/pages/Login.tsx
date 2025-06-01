import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone } from 'lucide-react';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
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
    verifyOtp 
  } = useAuth();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as LocationState)?.from?.pathname || "/dashboard";
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setOtp('');
    setIsOtpSent(false);
  };

  const handleTabChange = (value: string) => {
    setIsSignUp(value === 'signup');
    resetForm();
  };
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      toast({
        title: "Missing information",
        description: "Please enter your first and last name",
        variant: "destructive",
      });
      return;
    }

    const contactValue = contactMethod === 'email' ? email : phoneNumber;
    
    if (!contactValue || (contactMethod === 'email' ? !email.includes('@') : phoneNumber.length < 10)) {
      toast({
        title: `Invalid ${contactMethod}`,
        description: `Please enter a valid ${contactMethod}`,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        if (contactMethod === 'email') {
          // For email signup, we don't send OTP immediately, user needs to check email
          result = await signUp(email, 'temp-password-123', firstName, lastName);
        } else {
          result = await signUpWithPhone(phoneNumber, firstName, lastName);
        }
      } else {
        if (contactMethod === 'email') {
          result = await signInWithEmail(email);
        } else {
          result = await signInWithPhone(phoneNumber);
        }
      }
      
      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message || "Something went wrong",
          variant: "destructive",
        });
      } else {
        if (contactMethod === 'email' && isSignUp) {
          toast({
            title: "Check your email",
            description: "Please check your email for a confirmation link to complete signup",
          });
        } else {
          setIsOtpSent(true);
          toast({
            title: "OTP Sent",
            description: `A verification code has been sent to your ${contactMethod}`,
          });
        }
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
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const contactValue = contactMethod === 'email' ? email : phoneNumber;
      const otpType = contactMethod === 'email' ? 'email' : 'sms';
      
      const { error } = await verifyOtp(otp, otpType, contactValue);
      
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
                : isOtpSent 
                  ? `Enter the 6-digit verification code sent to your ${contactMethod}` 
                  : "Sign in to your account or create a new one"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOtpSent ? (
              <>
                <Tabs value={isSignUp ? 'signup' : 'login'} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-3">
                        <Label>How would you like to login?</Label>
                        <RadioGroup 
                          value={contactMethod} 
                          onValueChange={(value) => setContactMethod(value as ContactMethod)}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phone" id="phone-login" />
                            <Label htmlFor="phone-login" className="flex items-center gap-2">
                              <Phone size={16} />
                              Phone
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email-login" />
                            <Label htmlFor="email-login" className="flex items-center gap-2">
                              <Mail size={16} />
                              Email
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {contactMethod === 'phone' ? (
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="border-bullion-purple-200 focus:border-bullion-purple-500"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-bullion-purple-200 focus:border-bullion-purple-500"
                          />
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-bullion hover:opacity-90"
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Send Verification Code'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="border-bullion-purple-200 focus:border-bullion-purple-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="border-bullion-purple-200 focus:border-bullion-purple-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>How would you like to sign up?</Label>
                        <RadioGroup 
                          value={contactMethod} 
                          onValueChange={(value) => setContactMethod(value as ContactMethod)}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phone" id="phone-signup" />
                            <Label htmlFor="phone-signup" className="flex items-center gap-2">
                              <Phone size={16} />
                              Phone
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email-signup" />
                            <Label htmlFor="email-signup" className="flex items-center gap-2">
                              <Mail size={16} />
                              Email
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {contactMethod === 'phone' ? (
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumberSignup">Phone Number</Label>
                          <Input
                            id="phoneNumberSignup"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="border-bullion-purple-200 focus:border-bullion-purple-500"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="emailSignup">Email Address</Label>
                          <Input
                            id="emailSignup"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-bullion-purple-200 focus:border-bullion-purple-500"
                          />
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-bullion hover:opacity-90"
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
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
            ) : (
              // OTP verification form with new design
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-center block">Enter verification code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      className="gap-2"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot 
                          index={0} 
                          className="w-12 h-12 text-lg border-bullion-purple-200 focus:border-bullion-purple-500 focus:ring-bullion-purple-500" 
                        />
                        <InputOTPSlot 
                          index={1} 
                          className="w-12 h-12 text-lg border-bullion-purple-200 focus:border-bullion-purple-500 focus:ring-bullion-purple-500" 
                        />
                        <InputOTPSlot 
                          index={2} 
                          className="w-12 h-12 text-lg border-bullion-purple-200 focus:border-bullion-purple-500 focus:ring-bullion-purple-500" 
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-bullion-purple-400" />
                      <InputOTPGroup>
                        <InputOTPSlot 
                          index={3} 
                          className="w-12 h-12 text-lg border-bullion-purple-200 focus:border-bullion-purple-500 focus:ring-bullion-purple-500" 
                        />
                        <InputOTPSlot 
                          index={4} 
                          className="w-12 h-12 text-lg border-bullion-purple-200 focus:border-bullion-purple-500 focus:ring-bullion-purple-500" 
                        />
                        <InputOTPSlot 
                          index={5} 
                          className="w-12 h-12 text-lg border-bullion-purple-200 focus:border-bullion-purple-500 focus:ring-bullion-purple-500" 
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-bullion hover:opacity-90"
                    disabled={loading || otp.length < 6}
                  >
                    {loading ? 'Verifying...' : `Verify & ${isSignUp ? 'Create Account' : 'Login'}`}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-bullion-purple hover:text-bullion-purple-800"
                    onClick={() => setIsOtpSent(false)}
                    disabled={loading}
                  >
                    Change {contactMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;
