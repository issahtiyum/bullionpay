
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Phone, Eye, EyeOff } from 'lucide-react';

type ContactMethod = 'email' | 'phone';

type SignupFormProps = {
  onSubmit: (
    contactMethod: ContactMethod, 
    contactValue: string, 
    firstName: string, 
    lastName: string, 
    password?: string
  ) => Promise<void>;
  loading: boolean;
};

const SignupForm = ({ onSubmit, loading }: SignupFormProps) => {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactValue = contactMethod === 'email' ? email : phoneNumber;
    await onSubmit(
      contactMethod, 
      contactValue, 
      firstName, 
      lastName, 
      contactMethod === 'email' ? password : undefined
    );
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
        <>
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
        </>
      )}
      
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
