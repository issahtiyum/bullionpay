
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const PasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const handleResetSubmit = async (email: string) => {
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
          title: "Reset failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
      } else {
        setSentEmail(email);
        setEmailSent(true);
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

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <Card className="border-bullion-purple-100">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-semibold">
                {emailSent ? "Check Your Email" : "Reset Password"}
              </CardTitle>
            </div>
            <CardDescription>
              {emailSent
                ? `We've sent a password reset link to ${sentEmail}`
                : "Enter your email address and we'll send you a link to reset your password"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to reset your password. The link will expire in 1 hour.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-bullion-purple-200 hover:bg-bullion-purple-50"
                    onClick={() => handleResetSubmit(sentEmail)}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend Email'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-bullion-purple hover:text-bullion-purple-800"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <PasswordResetForm onSubmit={handleResetSubmit} loading={loading} />
                
                <div className="mt-4 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-bullion-purple hover:text-bullion-purple-800 hover:underline"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PasswordReset;
