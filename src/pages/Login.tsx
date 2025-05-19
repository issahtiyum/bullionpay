
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type LocationState = {
  from?: {
    pathname: string;
  };
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as LocationState)?.from?.pathname || "/dashboard";
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate OTP sending - in a real app, this would call Supabase auth
    setTimeout(() => {
      setLoading(false);
      setIsOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${phoneNumber}`,
      });
    }, 1500);
  };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid verification code",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate OTP verification - in a real app, this would verify with Supabase
    setTimeout(() => {
      setLoading(false);
      login(phoneNumber);
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      navigate(from, { replace: true });
    }, 1500);
  };
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-bullion-purple-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              {from.includes('/checkout') 
                ? "Please sign in to complete your purchase"
                : isOtpSent 
                  ? `Enter the verification code sent to ${phoneNumber}` 
                  : "Sign in using your phone number"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOtpSent ? (
              // Phone number form
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    minLength={10}
                    maxLength={10}
                    className="border-bullion-purple-200 focus:border-bullion-purple-500"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-bullion hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              // OTP verification form
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    minLength={4}
                    className="text-center tracking-widest text-lg border-bullion-purple-200"
                  />
                </div>
                
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-bullion hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-bullion-purple hover:text-bullion-purple-800"
                    onClick={() => setIsOtpSent(false)}
                    disabled={loading}
                  >
                    Change Phone Number
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
