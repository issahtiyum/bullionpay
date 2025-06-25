
export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCustomFields = (
  fields: CustomField[],
  data: Record<string, string>
): ValidationResult => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const value = data[field.id];

    // Check required fields
    if (field.required && (!value || value.trim() === '')) {
      errors[field.id] = `${field.label} is required`;
      return;
    }

    // Skip validation for empty optional fields
    if (!value || value.trim() === '') {
      return;
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.id] = 'Please enter a valid email address';
        }
        break;

      case 'number':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors[field.id] = 'Please enter a valid number';
        } else {
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            errors[field.id] = `Value must be at least ${field.validation.min}`;
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            errors[field.id] = `Value must be no more than ${field.validation.max}`;
          }
        }
        break;

      case 'select':
        if (field.options && !field.options.includes(value)) {
          errors[field.id] = 'Please select a valid option';
        }
        break;
    }

    // Common validation rules
    if (field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        errors[field.id] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }
      
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors[field.id] = `${field.label} format is invalid`;
        }
      }
    }

    // Security validation - prevent common injection attempts
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
    ];

    if (dangerousPatterns.some(pattern => pattern.test(value))) {
      errors[field.id] = 'Invalid characters detected';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeCustomFieldData = (data: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Basic sanitization
    sanitized[key] = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols  
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  });
  
  return sanitized;
};
