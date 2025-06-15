
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

type SignupFormProps = {
  onSubmit: (
    contactMethod: 'email', 
    contactValue: string, 
    firstName: string, 
    lastName: string, 
    password: string
  ) => Promise<void>;
  loading: boolean;
};

const SignupForm = ({ onSubmit, loading }: SignupFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit('email', email, firstName, lastName, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="passwordSignup">Password</Label>
        <div className="relative">
          <Input
            id="passwordSignup"
            type={showPassword ? "text" : "password"}
            placeholder="Create a secure password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-bullion hover:opacity-90"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignupForm;
