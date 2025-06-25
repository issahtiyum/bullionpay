
import React, { useState, useEffect } from 'react';
import { type Product } from './ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { CustomField } from '@/components/admin/CustomFieldsManager';
import EmailInput from './checkout/EmailInput';
import PaymentButton from './checkout/PaymentButton';
import CustomFieldsForm from './checkout/CustomFieldsForm';

type CheckoutFormProps = {
  product: Product;
  onPaymentSuccess: () => void;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ product, onPaymentSuccess }) => {
  const [email, setEmail] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  
  // Pre-fill email with user's email when component mounts
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const customFields = (product.custom_fields as CustomField[]) || [];

  const validateCustomFields = () => {
    const errors: Record<string, string> = {};
    
    customFields.forEach(field => {
      const value = customFieldValues[field.id] || '';
      
      if (field.required && !value.trim()) {
        errors[field.id] = `${field.label} is required`;
      } else if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        errors[field.id] = 'Please enter a valid email address';
      }
    });
    
    setCustomFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field if it exists
    if (customFieldErrors[fieldId]) {
      setCustomFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Fix the validation logic - separate email validation from custom fields validation
  const isEmailValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
  const areCustomFieldsValid = validateCustomFields();
  const isValid = isEmailValid && areCustomFieldsValid;
  
  return (
    <div className="space-y-4">
      <EmailInput 
        email={email} 
        onEmailChange={setEmail} 
      />
      
      {customFields.length > 0 && (
        <CustomFieldsForm
          fields={customFields}
          values={customFieldValues}
          onChange={handleCustomFieldChange}
          errors={customFieldErrors}
        />
      )}
      
      <PaymentButton 
        product={product}
        email={email}
        customFieldData={customFieldValues}
        isValid={isValid}
        onSuccess={onPaymentSuccess}
      />
    </div>
  );
};

export default CheckoutForm;
