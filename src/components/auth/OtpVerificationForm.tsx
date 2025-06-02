
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';

type ContactMethod = 'email' | 'phone';

type OtpVerificationFormProps = {
  contactMethod: ContactMethod;
  isSignUp: boolean;
  onVerify: (otp: string) => Promise<void>;
  onChangeContact: () => void;
  loading: boolean;
};

const OtpVerificationForm = ({ 
  contactMethod, 
  isSignUp, 
  onVerify, 
  onChangeContact, 
  loading 
}: OtpVerificationFormProps) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onVerify(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          onClick={onChangeContact}
          disabled={loading}
        >
          Change {contactMethod === 'phone' ? 'Phone Number' : 'Email Address'}
        </Button>
      </div>
    </form>
  );
};

export default OtpVerificationForm;
