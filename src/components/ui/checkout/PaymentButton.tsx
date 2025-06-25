
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useSecureTransactionManager } from '@/hooks/useSecureTransactionManager';
import { type Product } from '@/components/ui/ProductCard';

interface PaymentButtonProps {
  product: Product;
  email: string;
  customFieldData: Record<string, string>;
  isValid: boolean;
  onSuccess?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  product,
  email,
  customFieldData,
  isValid,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { initializePaystackPayment } = usePaystackIntegration();
  const { 
    createSecureTransaction, 
    verifyPaymentSecure, 
    createSecureOrder,
    validatePayment 
  } = useSecureTransactionManager();

  const handlePayment = async () => {
    if (!isValid) {
      console.log('Payment validation failed:', { isValid, email, customFieldData });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting payment process...');
      
      // Pre-validate payment before initializing
      await validatePayment(product, product.price);
      
      await initializePaystackPayment(
        product,
        email,
        async (response: any, reference: string) => {
          try {
            console.log('Payment successful, processing securely...', { response, reference });
            
            // Create secure transaction record
            const transaction = await createSecureTransaction(
              product, 
              reference, 
              response.reference
            );
            
            // Verify payment securely
            await verifyPaymentSecure(response.reference);
            
            // Create secure order
            const order = await createSecureOrder(
              product,
              transaction.id,
              customFieldData
            );
            
            if (order) {
              console.log('Secure order creation completed successfully');
              onSuccess?.();
            }
          } catch (error) {
            console.error('Secure payment processing failed:', error);
            setLoading(false);
          }
        },
        () => {
          console.log('Payment dialog closed');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setLoading(false);
    }
  };

  // Add safety check for product data
  if (!product || !product.price) {
    console.error('Invalid product data:', product);
    return (
      <Button disabled className="w-full" size="lg">
        Invalid Product
      </Button>
    );
  }

  return (
    <Button 
      onClick={handlePayment}
      disabled={!isValid || loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay GH₵${Number(product.price).toFixed(2)}`
      )}
    </Button>
  );
};

export default PaymentButton;
