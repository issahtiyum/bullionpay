
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type ContactMethod = 'email' | 'phone';

type LoginHeaderProps = {
  from: string;
  showResetPassword: boolean;
  showForgotPassword: boolean;
  isResetLinkSent: boolean;
  isEmailConfirmationSent: boolean;
  isOtpSent: boolean;
  contactMethod: ContactMethod;
};

const LoginHeader = ({ 
  from, 
  showResetPassword, 
  showForgotPassword, 
  isResetLinkSent, 
  isEmailConfirmationSent, 
  isOtpSent, 
  contactMethod 
}: LoginHeaderProps) => {
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
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl font-semibold">
        {getCardTitle()}
      </CardTitle>
      <CardDescription>
        {getCardDescription()}
      </CardDescription>
    </CardHeader>
  );
};

export default LoginHeader;
