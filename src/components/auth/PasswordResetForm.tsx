
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

type PasswordResetFormProps = {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
};

const PasswordResetForm = ({ onSubmit, loading }: PasswordResetFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 border-bullion-purple-200 focus:border-bullion-purple-500"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          We'll send you a link to reset your password
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-bullion hover:opacity-90"
        disabled={loading || !email.includes('@')}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
};

export default PasswordResetForm;
