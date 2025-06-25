
import React from 'react';
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
  const { initializePayment, loading } = usePaystackIntegration();
  const { 
    createSecureTransaction, 
    verifyPaymentSecure, 
    createSecureOrder,
    validatePayment 
  } = useSecureTransactionManager();

  const handlePayment = async () => {
    if (!isValid) return;

    try {
      // Pre-validate payment before initializing
      await validatePayment(product, product.price);
      
      await initializePayment({
        email,
        amount: product.price,
        onSuccess: async (reference: any) => {
          try {
            console.log('Payment successful, processing securely...');
            
            // Create secure transaction record
            const transaction = await createSecureTransaction(
              product, 
              reference.reference, 
              reference.reference
            );
            
            // Verify payment securely
            await verifyPaymentSecure(reference.reference);
            
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
          }
        },
        onClose: () => {
          console.log('Payment dialog closed');
        }
      });
    } catch (error) {
      console.error('Payment initialization failed:', error);
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
