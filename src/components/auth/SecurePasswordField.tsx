
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurePasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

const SecurePasswordField: React.FC<SecurePasswordFieldProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  showStrengthIndicator = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-400',
    label: 'No password'
  });

  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: [], color: 'text-gray-400', label: 'No password' };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 12) {
      score += 2;
    } else if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeated characters');

    // Sequential patterns
    if (!/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)) {
      score += 1;
    } else {
      feedback.push('Avoid sequential patterns');
    }

    // Determine strength level
    let color = 'text-red-500';
    let label = 'Very Weak';

    if (score >= 7) {
      color = 'text-green-500';
      label = 'Very Strong';
    } else if (score >= 5) {
      color = 'text-blue-500';
      label = 'Strong';
    } else if (score >= 3) {
      color = 'text-yellow-500';
      label = 'Fair';
    } else if (score >= 1) {
      color = 'text-orange-500';
      label = 'Weak';
    }

    return { score, feedback, color, label };
  };

  useEffect(() => {
    if (showStrengthIndicator) {
      setStrength(evaluatePasswordStrength(value));
    }
  }, [value, showStrengthIndicator]);

  const getStrengthBarColor = (index: number): string => {
    if (strength.score === 0) return 'bg-gray-200';
    
    const filledBars = Math.ceil((strength.score / 8) * 4);
    if (index < filledBars) {
      if (strength.score >= 7) return 'bg-green-500';
      if (strength.score >= 5) return 'bg-blue-500';
      if (strength.score >= 3) return 'bg-yellow-500';
      if (strength.score >= 1) return 'bg-orange-500';
      return 'bg-red-500';
    }
    return 'bg-gray-200';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-medium">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      </Label>
      
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${error ? 'border-red-500' : ''}`}
          autoComplete="new-password"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      {showStrengthIndicator && value && (
        <div className="space-y-2">
          {/* Strength bar */}
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-sm transition-colors ${getStrengthBarColor(index)}`}
              />
            ))}
          </div>
          
          {/* Strength label */}
          <div className="flex items-center gap-2 text-sm">
            <span className={strength.color}>
              {strength.label}
            </span>
            {strength.score >= 5 && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          {/* Feedback */}
          {strength.feedback.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Password Suggestions:
                </span>
              </div>
              <ul className="text-xs text-amber-700 space-y-1">
                {strength.feedback.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SecurePasswordField;
