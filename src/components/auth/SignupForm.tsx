
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const countryCodes = [
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
];

const SignupForm = ({ onSubmit, loading }: SignupFormProps) => {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+233');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactValue = contactMethod === 'email' ? email : `${countryCode}${phoneNumber}`;
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
          <div className="flex gap-2">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-32 border-bullion-purple-200 focus:border-bullion-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phoneNumberSignup"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="flex-1 border-bullion-purple-200 focus:border-bullion-purple-500"
            />
          </div>
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
