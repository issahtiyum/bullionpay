
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText } from '@/utils/sanitizer';
import { type Product } from '@/components/ui/ProductCard';

export const useTransactionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createTransaction = async (product: Product, reference: string, paystackReference: string) => {
    // Validate inputs
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!product?.id || !product?.price || product.price <= 0) {
      throw new Error('Invalid product data');
    }

    const sanitizedReference = sanitizeText(reference);
    const sanitizedPaystackRef = sanitizeText(paystackReference);

    if (!sanitizedReference || !sanitizedPaystackRef) {
      throw new Error('Invalid payment references');
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        reference: sanitizedReference,
        amount: product.price,
        status: 'pending',
        paystack_reference: sanitizedPaystackRef,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
    }

    return transaction;
  };

  const verifyPayment = async (paystackReference: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const sanitizedReference = sanitizeText(paystackReference);
    if (!sanitizedReference) {
      throw new Error('Invalid payment reference');
    }

    const { data: verificationResponse, error: verificationError } = await supabase.functions.invoke('verify-payment-secure', {
      body: {
        reference: sanitizedReference,
        user_id: user.id,
      },
    });

    if (verificationError) {
      console.error('Payment verification error:', verificationError);
      throw new Error(`Payment verification failed: ${verificationError.message}`);
    }

    return verificationResponse;
  };

  const createOrder = async (
    product: Product,
    transactionId: string,
    customFieldData: Record<string, string>
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!product?.id || !transactionId) {
      throw new Error('Invalid order data');
    }

    // Sanitize custom field data
    const sanitizedCustomFieldData = Object.entries(customFieldData).reduce((acc, [key, value]) => {
      acc[sanitizeText(key)] = sanitizeText(value);
      return acc;
    }, {} as Record<string, string>);

    // Check if this is a subscription renewal
    if (product.category === 'Subscription') {
      const { data: existingOrders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('is_subscription', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!fetchError && existingOrders && existingOrders.length > 0) {
        const existingOrder = existingOrders[0];
        
        // Get custom subscription duration or default to 30 days
        const existingCustomData = (existingOrder.custom_field_data as any) || {};
        const subscriptionDays = Math.max(1, Math.min(365, parseInt(existingCustomData.subscription_days) || 30));
        
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
            transaction_id: transactionId,
          })
          .eq('id', existingOrder.id)
          .select()
          .single();

        if (!updateError && updatedOrder) {
          toast({
            title: "Subscription renewed",
            description: `Your subscription has been extended by ${subscriptionDays} days!`,
          });
          return updatedOrder;
        }
      }
    }
    
    // Create new order (either not a subscription or no existing subscription found)
    const defaultSubscriptionDays = 30;
    const subscriptionDays = product.category === 'Subscription' 
      ? Math.max(1, Math.min(365, parseInt(sanitizedCustomFieldData.subscription_days) || defaultSubscriptionDays))
      : null;

    const orderData = {
      user_id: user.id,
      transaction_id: transactionId,
      product_id: product.id,
      product_name: sanitizeText(product.name),
      product_category: sanitizeText(product.category),
      amount: product.price,
      status: 'pending',
      is_subscription: product.category === 'Subscription',
      next_billing_date: product.category === 'Subscription' 
        ? new Date(Date.now() + (subscriptionDays! * 24 * 60 * 60 * 1000)).toISOString()
        : null,
      custom_field_data: product.category === 'Subscription' 
        ? { ...sanitizedCustomFieldData, subscription_days: subscriptionDays }
        : sanitizedCustomFieldData,
    };

    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      toast({
        title: "Payment successful",
        description: `Payment completed but order creation had an issue: ${orderError.message}. Please contact support with your reference: ${transactionId}`,
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
