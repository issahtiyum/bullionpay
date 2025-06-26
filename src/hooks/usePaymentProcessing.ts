
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { type Product } from '@/components/ui/ProductCard';

export const usePaymentProcessing = (product: Product, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      // First, create the order with custom field data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          amount: product.price,
          status: 'pending',
          custom_field_data: customFieldValues, // Store custom field data
          is_subscription: product.category === 'subscriptions',
          next_billing_date: product.category === 'subscriptions' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created with custom field data:', order);

      // For now, simulate payment success
      // In a real implementation, you would integrate with Paystack here
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw updateError;
      }

      toast({
        title: "Payment Successful",
        description: "Your order has been processed successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    processPayment
  };
};
