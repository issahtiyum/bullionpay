
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/components/ui/ProductCard';

export const useTransactionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createTransaction = async (product: Product, reference: string, paystackReference: string) => {
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
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
    }

    return transaction;
  };

  const verifyPayment = async (paystackReference: string) => {
    const { data: verificationResponse, error: verificationError } = await supabase.functions.invoke('verify-payment', {
      body: {
        reference: paystackReference,
        user_id: user!.id,
      },
    });

    if (verificationError) {
      throw new Error(`Payment verification failed: ${verificationError.message}`);
    }

    // Parse the response if it's a string
    let verificationData;
    try {
      verificationData = typeof verificationResponse === 'string' 
        ? JSON.parse(verificationResponse) 
        : verificationResponse;
    } catch (parseError) {
      throw new Error('Invalid verification response format');
    }

    return verificationData;
  };

  const createOrder = async (
    product: Product,
    transactionId: string,
    customFieldData: Record<string, string>
  ) => {
    // Check if this is a subscription renewal
    if (product.category === 'Subscription') {
      const { data: existingOrders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .eq('product_id', product.id)
        .eq('is_subscription', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        // Continue with new order creation
      } else if (existingOrders && existingOrders.length > 0) {
        const existingOrder = existingOrders[0];
        
        // Get custom subscription duration or default to 30 days
        const existingCustomData = (existingOrder.custom_field_data as any) || {};
        const subscriptionDays = existingCustomData.subscription_days || 30;
        
        // Calculate new billing date (extend by specified days from current next_billing_date or now)
        const currentBillingDate = existingOrder.next_billing_date 
          ? new Date(existingOrder.next_billing_date)
          : new Date();
        const newBillingDate = new Date(currentBillingDate.getTime() + subscriptionDays * 24 * 60 * 60 * 1000);
        
        // Update the existing subscription
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            next_billing_date: newBillingDate.toISOString(),
            updated_at: new Date().toISOString(),
            transaction_id: transactionId, // Link to the new transaction
          })
          .eq('id', existingOrder.id)
          .select()
          .single();

        if (updateError) {
          // Continue with new order creation
        } else {
          toast({
            title: "Subscription renewed",
            description: `Your subscription has been extended by ${subscriptionDays} days!`,
          });
          return updatedOrder;
        }
      }
    }
    
    // Create new order (either not a subscription or no existing subscription found)
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
      custom_field_data: product.category === 'Subscription' 
        ? { ...customFieldData, subscription_days: 30 }
        : customFieldData,
    };

    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      toast({
        title: "Payment successful",
        description: `Payment completed but order creation had an issue: ${orderError.message}. Please contact support with your reference: ${orderData.transaction_id}`,
        variant: "destructive",
      });
      
      return null;
    }

    return orderResult;
  };

  return {
    createTransaction,
    verifyPayment,
    createOrder,
  };
};
