
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/components/ui/ProductCard';
import { usePaymentValidation } from './usePaymentValidation';
import { usePaystackIntegration } from './usePaystackIntegration';
import { useTransactionManager } from './useTransactionManager';

export const usePaymentProcessing = (product: Product, onPaymentSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { validatePaymentInputs } = usePaymentValidation();
  const { initializePaystackPayment } = usePaystackIntegration();
  const { createTransaction, verifyPayment, createOrder } = useTransactionManager();

  const processPayment = async (email: string, customFieldData: Record<string, string> = {}) => {
    if (!validatePaymentInputs(email)) {
      return;
    }
    
    setLoading(true);
    
    try {
      await initializePaystackPayment(
        product,
        email,
        (response, reference) => handleSuccessfulPayment(response, reference, customFieldData),
        () => setLoading(false)
      );
    } catch (error) {
      setLoading(false);
      console.error('Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Payment failed",
        description: `Failed to initialize payment: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleSuccessfulPayment = async (
    response: any, 
    reference: string, 
    customFieldData: Record<string, string>
  ) => {
    try {
      console.log('Starting payment processing...');
      
      const transaction = await createTransaction(product, reference, response.reference);
      const verificationData = await verifyPayment(response.reference);

      if (verificationData && verificationData.success === true) {
        const orderResult = await createOrder(product, transaction.id, customFieldData);
        
        if (orderResult) {
          toast({
            title: "Payment successful",
            description: "Your order has been placed successfully and is pending delivery!",
          });
        }
        
        onPaymentSuccess();
      } else {
        console.error('Payment verification failed - data:', verificationData);
        toast({
          title: "Payment verification failed",
          description: "Please contact support if you were charged.",
          variant: "destructive",
        });
      }
    } catch (processingError) {
      console.error('Payment processing error:', processingError);
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error occurred';
      toast({
        title: "Payment processing failed",
        description: `Error: ${errorMessage}. Please contact support if you were charged.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    processPayment,
  };
};
