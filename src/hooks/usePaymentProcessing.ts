
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { type Product } from '@/components/ui/ProductCard';
import { generatePaymentReference, convertToKobo, loadPaystackScript } from '@/utils/paymentUtils';

export const usePaymentProcessing = (product: Product, onPaymentSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const processPayment = async (email: string) => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the Paystack public key
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-paystack-key');
      
      if (keyError || !keyData?.publicKey) {
        throw new Error('Failed to get payment configuration');
      }

      const reference = generatePaymentReference();
      const amountInKobo = convertToKobo(product.price);

      // Load Paystack script and initialize payment
      await loadPaystackScript();
      
      // @ts-ignore - Paystack is loaded globally
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: keyData.publicKey,
        email,
        amount: amountInKobo,
        reference,
        currency: 'GHS',
        callback: async (response: any) => {
          console.log('Paystack callback response:', response);
          setLoading(false);
          
          if (response.status === 'success') {
            await handleSuccessfulPayment(response, reference);
          } else {
            console.log('Payment was not successful:', response);
            toast({
              title: "Payment cancelled",
              description: "Your payment was not completed.",
              variant: "destructive",
            });
          }
        },
        onClose: () => {
          console.log('Payment popup closed by user');
          setLoading(false);
          toast({
            title: "Payment cancelled",
            description: "You cancelled the payment process.",
          });
        },
      });

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

  const handleSuccessfulPayment = async (response: any, reference: string) => {
    try {
      console.log('Starting payment processing...');
      
      // Create transaction record
      console.log('Creating transaction record...');
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          reference,
          amount: product.price,
          status: 'pending',
          paystack_reference: response.reference,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        throw new Error(`Failed to create transaction record: ${transactionError.message}`);
      }

      console.log('Transaction created successfully:', transaction);

      // Verify payment on backend
      console.log('Verifying payment...');
      const { data: verificationResponse, error: verificationError } = await supabase.functions.invoke('verify-payment', {
        body: {
          reference: response.reference,
          user_id: user!.id,
        },
      });

      if (verificationError) {
        console.error('Verification error:', verificationError);
        throw new Error(`Payment verification failed: ${verificationError.message}`);
      }

      console.log('Raw verification response:', verificationResponse);

      // Parse the response if it's a string
      let verificationData;
      try {
        verificationData = typeof verificationResponse === 'string' 
          ? JSON.parse(verificationResponse) 
          : verificationResponse;
      } catch (parseError) {
        console.error('Failed to parse verification response:', parseError);
        throw new Error('Invalid verification response format');
      }

      console.log('Parsed verification data:', verificationData);

      // Check if verification was successful
      if (verificationData && verificationData.success === true) {
        console.log('Payment verified successfully, creating order...');
        
        // Create order record with pending status after successful verification
        const orderData = {
          user_id: user!.id,
          transaction_id: transaction.id,
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          amount: product.price,
          status: 'pending',
          is_subscription: product.category === 'Subscription',
          next_billing_date: product.category === 'Subscription' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        };

        console.log('Attempting to create order with data:', orderData);

        const { data: orderResult, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          console.error('Order creation error:', orderError);
          console.error('Order error details:', {
            message: orderError.message,
            details: orderError.details,
            hint: orderError.hint,
            code: orderError.code
          });
          
          toast({
            title: "Payment successful",
            description: `Payment completed but order creation had an issue: ${orderError.message}. Please contact support with your reference: ${response.reference}`,
            variant: "destructive",
          });
          
          onPaymentSuccess();
          return;
        }

        console.log('Order created successfully:', orderResult);

        toast({
          title: "Payment successful",
          description: "Your order has been placed successfully and is pending delivery!",
        });
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
    }
  };

  return {
    loading,
    processPayment,
  };
};
