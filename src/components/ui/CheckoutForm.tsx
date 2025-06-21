
import React, { useState, useEffect } from 'react';
import { type Product } from './ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import EmailInput from './checkout/EmailInput';
import PaymentButton from './checkout/PaymentButton';

type CheckoutFormProps = {
  product: Product;
  onPaymentSuccess: () => void;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ product, onPaymentSuccess }) => {
  const [email, setEmail] = useState('');
  const { user } = useAuth();
  const { loading, processPayment } = usePaymentProcessing(product, onPaymentSuccess);
  
  // Pre-fill email with user's email when component mounts
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processPayment(email);
  };
  
  return (
    <div className="space-y-4">
      <EmailInput 
        email={email} 
        onEmailChange={setEmail} 
      />
      
      <PaymentButton 
        product={product}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CheckoutForm;
