
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EmailInputProps = {
  email: string;
  onEmailChange: (email: string) => void;
};

const EmailInput: React.FC<EmailInputProps> = ({ email, onEmailChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
        className="border-bullion-purple-200 focus:border-bullion-purple-500"
      />
      <p className="text-sm text-gray-600">
        A receipt and order confirmation will be sent to this email address.
      </p>
    </div>
  );
};

export default EmailInput;
