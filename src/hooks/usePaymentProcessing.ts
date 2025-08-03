
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useTransactionManager } from '@/hooks/useTransactionManager';
import { usePaymentValidation } from '@/hooks/usePaymentValidation';
import { sanitizeText } from '@/utils/sanitizer';
import { type Product } from '@/components/ui/ProductCard';

export const usePaymentProcessing = (product: Product, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { initializePaystackPayment } = usePaystackIntegration();
  const { createTransaction, verifyPayment, createOrder } = useTransactionManager();
  const { validatePaymentInputs, validateCustomFields } = usePaymentValidation();

  const processPayment = async (email: string, customFieldValues: Record<string, string>, customFields: any[] = []) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a purchase",
        variant: "destructive",
      });
      return;
    }

    // Sanitize email input
    const sanitizedEmail = sanitizeText(email.trim());

    // Validate payment inputs
    if (!validatePaymentInputs(sanitizedEmail)) {
      return;
    }

    // Validate custom fields if present
    if (customFields.length > 0) {
      const fieldValidation = validateCustomFields(customFields, customFieldValues);
      if (!fieldValidation.isValid) {
        const firstError = Object.values(fieldValidation.errors)[0];
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      console.log('Starting payment process for product:', product.name);

      // Sanitize custom field values
      const sanitizedCustomFields = Object.entries(customFieldValues).reduce((acc, [key, value]) => {
        acc[key] = sanitizeText(value);
        return acc;
      }, {} as Record<string, string>);

      // Initialize Paystack payment
      await initializePaystackPayment(
        product,
        sanitizedEmail,
        async (response, reference) => {
          try {
            console.log('Payment callback received:', response);
            
            // Validate response
            if (!response.reference || !response.status) {
              throw new Error('Invalid payment response');
            }
            
            // Create transaction record
            const transaction = await createTransaction(product, reference, response.reference);
            console.log('Transaction created:', transaction);

            // Use the secure payment verification endpoint
            const { data: verificationResponse, error: verificationError } = await supabase.functions.invoke('verify-payment-secure', {
              body: {
                reference: response.reference,
                user_id: user.id,
              },
            });

            if (verificationError) {
              throw new Error(`Payment verification failed: ${verificationError.message}`);
            }

            console.log('Payment verification result:', verificationResponse);

            if (verificationResponse.success && verificationResponse.data?.status === 'success') {
              // Create order after successful payment
              const order = await createOrder(product, transaction.id, sanitizedCustomFields);
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
