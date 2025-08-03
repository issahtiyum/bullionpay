
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { validateInput, sanitizeText } from '@/utils/sanitizer';

export const usePaymentValidation = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePaymentInputs = (email: string) => {
    // Sanitize input first
    const sanitizedEmail = sanitizeText(email.trim());
    
    if (!sanitizedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }

    if (!validateInput.email(sanitizedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateCustomFields = (fields: any[], values: Record<string, string>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    for (const field of fields) {
      const value = values[field.id] || '';
      const sanitizedValue = sanitizeText(value);
      
      // Check required fields
      if (field.required && !sanitizedValue.trim()) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }
      
      // Skip validation for empty optional fields
      if (!sanitizedValue.trim() && !field.required) {
        continue;
      }
      
      // Validate field type
      if (!validateInput.customField(sanitizedValue, field.type)) {
        switch (field.type) {
          case 'email':
            errors[field.id] = 'Please enter a valid email address';
            break;
          case 'tel':
            errors[field.id] = 'Please enter a valid phone number';
            break;
          case 'number':
            errors[field.id] = 'Please enter a valid number';
            break;
          case 'url':
            errors[field.id] = 'Please enter a valid URL';
            break;
          default:
            errors[field.id] = 'Invalid input detected';
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return { 
    validatePaymentInputs,
    validateCustomFields
  };
};
