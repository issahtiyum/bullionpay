
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/components/ui/ProductCard';

export const useTransactionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createTransaction = async (product: Product, reference: string, paystackReference: string) => {
    console.log('Creating transaction record...');
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user!.id,
        reference,
        amount: product.price,
        status: 'pending',
        paystack_reference: paystackReference,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
    }

    console.log('Transaction created successfully:', transaction);
    return transaction;
  };

  const verifyPayment = async (paystackReference: string) => {
    console.log('Verifying payment...');
    const { data: verificationResponse, error: verificationError } = await supabase.functions.invoke('verify-payment', {
      body: {
        reference: paystackReference,
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
    return verificationData;
  };

  const createOrder = async (
    product: Product,
    transactionId: string,
    customFieldData: Record<string, string>
  ) => {
    console.log('Payment verified successfully, creating order...');
    
    const orderData = {
      user_id: user!.id,
      transaction_id: transactionId,
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      amount: product.price,
      status: 'pending',
      is_subscription: product.category === 'Subscription',
      next_billing_date: product.category === 'Subscription' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
      custom_field_data: customFieldData,
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
        description: `Payment completed but order creation had an issue: ${orderError.message}. Please contact support with your reference: ${orderData.transaction_id}`,
        variant: "destructive",
      });
      
      return null;
    }

    console.log('Order created successfully:', orderResult);
    return orderResult;
  };

  return {
    createTransaction,
    verifyPayment,
    createOrder,
  };
};
