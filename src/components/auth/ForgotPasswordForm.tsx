
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';

type ForgotPasswordFormProps = {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
};

const ForgotPasswordForm = ({ onSubmit, onBack, loading }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          className="p-0 h-auto text-bullion-purple hover:text-bullion-purple-800"
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resetEmail">Email Address</Label>
        <div className="relative">
          <Input
            id="resetEmail"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-bullion-purple-200 focus:border-bullion-purple-500 pl-10"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <p className="text-sm text-gray-600">
          We'll send you a link to reset your password
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-bullion hover:opacity-90"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
