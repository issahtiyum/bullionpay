
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';

type ContactMethod = 'email' | 'phone';

type LoginFormProps = {
  onSubmit: (contactMethod: ContactMethod, contactValue: string, password?: string) => Promise<void>;
  loading: boolean;
};

const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactValue = contactMethod === 'email' ? email : phoneNumber;
    await onSubmit(contactMethod, contactValue, contactMethod === 'email' ? password : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/reset-password"
                className="text-sm text-bullion-purple hover:text-bullion-purple-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-bullion-purple-200 focus:border-bullion-purple-500 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-bullion hover:opacity-90"
        disabled={loading}
      >
        {loading ? 'Processing...' : contactMethod === 'phone' ? 'Send Verification Code' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
