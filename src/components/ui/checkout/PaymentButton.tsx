
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
    if (!isValid) return;

    setLoading(true);
    try {
      // Pre-validate payment before initializing
      await validatePayment(product, product.price);
      
      await initializePaystackPayment(
        product,
        email,
        async (response: any, reference: string) => {
          try {
            console.log('Payment successful, processing securely...');
            
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
          } finally {
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
        `Pay GH₵${product.price}`
      )}
    </Button>
  );
};

export default PaymentButton;
