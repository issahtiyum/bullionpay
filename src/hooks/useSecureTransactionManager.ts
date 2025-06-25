
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/components/ui/ProductCard';

export const useSecureTransactionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const validatePayment = async (product: Product, amount: number) => {
    console.log('Validating payment server-side...');
    const { data, error } = await supabase.functions.invoke('validate-payment', {
      body: {
        productId: product.id,
        amount: amount,
        userId: user?.id,
      },
    });

    if (error) {
      console.error('Payment validation failed:', error);
      throw new Error(`Payment validation failed: ${error.message}`);
    }

    if (!data.valid) {
      throw new Error('Payment validation failed: Invalid payment data');
    }

    return data.product;
  };

  const logAuditEvent = async (action: string, tableName: string, recordId: string, newValues: any) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action: action,
          table_name: tableName,
          record_id: recordId,
          new_values: newValues
        });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  const createSecureTransaction = async (product: Product, reference: string, paystackReference: string) => {
    console.log('Creating secure transaction record...');
    
    // First validate the payment server-side
    await validatePayment(product, product.price);

    // Check for duplicate transaction
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user!.id)
      .eq('reference', reference)
      .maybeSingle();

    if (existingTransaction) {
      throw new Error('Transaction already exists');
    }

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

    console.log('Secure transaction created successfully:', transaction);
    return transaction;
  };

  const verifyPaymentSecure = async (paystackReference: string) => {
    console.log('Verifying payment securely...');
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

    let verificationData;
    try {
      verificationData = typeof verificationResponse === 'string' 
        ? JSON.parse(verificationResponse) 
        : verificationResponse;
    } catch (parseError) {
      console.error('Failed to parse verification response:', parseError);
      throw new Error('Invalid verification response format');
    }

    console.log('Payment verified successfully:', verificationData);
    return verificationData;
  };

  const createSecureOrder = async (
    product: Product,
    transactionId: string,
    customFieldData: Record<string, string>
  ) => {
    console.log('Creating secure order...');
    
    // Validate subscription extension logic
    if (product.category === 'Subscription') {
      console.log('Processing subscription order...');
      
      const { data: existingOrders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .eq('product_id', product.id)
        .eq('is_subscription', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching existing subscription:', fetchError);
      } else if (existingOrders && existingOrders.length > 0) {
        const existingOrder = existingOrders[0];
        console.log('Found existing subscription, extending it...', existingOrder);
        
        const existingCustomData = (existingOrder.custom_field_data as any) || {};
        const subscriptionDays = existingCustomData.subscription_days || 30;
        
        const currentBillingDate = existingOrder.next_billing_date 
          ? new Date(existingOrder.next_billing_date)
          : new Date();
        const newBillingDate = new Date(currentBillingDate.getTime() + subscriptionDays * 24 * 60 * 60 * 1000);
        
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

        if (updateError) {
          console.error('Error extending subscription:', updateError);
        } else {
          console.log('Subscription extended successfully:', updatedOrder);
          
          // Log the subscription extension
          await logAuditEvent('SUBSCRIPTION_EXTENDED', 'orders', existingOrder.id, { 
            new_billing_date: newBillingDate.toISOString(),
            transaction_id: transactionId,
            extension_days: subscriptionDays
          });

          toast({
            title: "Subscription renewed",
            description: `Your subscription has been extended by ${subscriptionDays} days!`,
          });
          return updatedOrder;
        }
      }
    }
    
    // Create new order with validation
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

    console.log('Creating new order with data:', orderData);

    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      
      // Log the order creation failure
      await logAuditEvent('ORDER_CREATION_FAILED', 'orders', 'N/A', { 
        error: orderError.message,
        order_data: orderData
      });
      
      toast({
        title: "Payment successful",
        description: `Payment completed but order creation had an issue: ${orderError.message}. Please contact support with your reference: ${orderData.transaction_id}`,
        variant: "destructive",
      });
      
      return null;
    }

    console.log('Order created successfully:', orderResult);
    
    // Log successful order creation
    await logAuditEvent('ORDER_CREATED', 'orders', orderResult.id, orderData);

    return orderResult;
  };

  return {
    createSecureTransaction,
    verifyPaymentSecure,
    createSecureOrder,
    validatePayment,
  };
};
