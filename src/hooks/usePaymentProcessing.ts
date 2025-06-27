
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useTransactionManager } from '@/hooks/useTransactionManager';
import { type Product } from '@/components/ui/ProductCard';

export const usePaymentProcessing = (product: Product, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { initializePaystackPayment } = usePaystackIntegration();
  const { createTransaction, verifyPayment, createOrder } = useTransactionManager();

  const processPayment = async (email: string, customFieldValues: Record<string, string>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a purchase",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting payment process for product:', product.name);

      // Initialize Paystack payment
      await initializePaystackPayment(
        product,
        email,
        async (response, reference) => {
          try {
            console.log('Payment callback received:', response);
            
            // Create transaction record
            const transaction = await createTransaction(product, reference, response.reference);
            console.log('Transaction created:', transaction);

            // Verify payment with Paystack
            const verificationResult = await verifyPayment(response.reference);
            console.log('Payment verification result:', verificationResult);

            if (verificationResult.success && verificationResult.status === 'success') {
              // Create order after successful payment
              const order = await createOrder(product, transaction.id, customFieldValues);
              console.log('Order created:', order);

              toast({
                title: "Payment Successful",
                description: "Your order has been processed successfully",
              });

              onSuccess();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            toast({
              title: "Payment Processing Error",
              description: "There was an error processing your payment. Please contact support.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        () => {
          console.log('Payment modal closed');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    loading,
    processPayment
  };
};
