
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePaystackIntegration } from '@/hooks/usePaystackIntegration';
import { useTransactionManager } from '@/hooks/useTransactionManager';
import { usePaymentValidation } from '@/hooks/usePaymentValidation';
import { sanitizeText } from '@/utils/sanitizer';
import { supabase } from '@/integrations/supabase/client';
import { type Product } from '@/components/ui/ProductCard';
import { securityMonitor } from '@/utils/securityMonitor';
import { auditLogger, AuditAction } from '@/utils/auditLogger';

export const useWebhookPaymentProcessing = (product: Product, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { initializePaystackPayment } = usePaystackIntegration();
  const { createTransaction } = useTransactionManager();
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

    const sanitizedEmail = sanitizeText(email.trim());
    const userAgent = navigator.userAgent;
    const securityCheck = await securityMonitor.checkPaymentAttempt(
      user.id, 
      product.price, 
      userAgent
    );

    if (!securityCheck.allowed) {
      toast({
        title: "Security Alert",
        description: securityCheck.reason || "Payment blocked for security reasons",
        variant: "destructive",
      });
      
      await auditLogger.logSecurityEvent(AuditAction.PAYMENT_FAILED, {
        userId: user.id,
        reason: 'security_block',
        productId: product.id,
        amount: product.price
      });
      
      return;
    }

    if (!validatePaymentInputs(sanitizedEmail)) {
      return;
    }

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
      console.log('Starting webhook-based payment process for product:', product.name);
      
      await auditLogger.logPaymentEvent(
        AuditAction.PAYMENT_INITIATED,
        `pending_${Date.now()}`,
        product.price,
        {
          productId: product.id,
          productName: product.name,
          email: sanitizedEmail
        }
      );

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
            
            if (!response.reference || !response.status) {
              throw new Error('Invalid payment response');
            }
            
            // Create transaction record for webhook processing
            const transaction = await createTransaction(product, reference, response.reference);
            console.log('Transaction created for webhook processing:', transaction);

            // Create order in pending status - webhook will update it
            const orderData = {
              user_id: user.id,
              transaction_id: transaction.id,
              product_id: product.id,
              product_name: sanitizeText(product.name),
              product_category: sanitizeText(product.category),
              amount: product.price,
              status: 'pending', // Webhook will update to 'paid' on success
              is_subscription: product.category === 'Subscription',
              next_billing_date: product.category === 'Subscription' 
                ? new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
                : null,
              custom_field_data: sanitizedCustomFields,
            };

            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert(orderData)
              .select()
              .single();

            if (orderError) {
              console.error('Order creation error:', orderError);
              throw new Error('Failed to create order');
            }

            console.log('Order created in pending status:', order);

            // Show immediate success message - webhook will handle final confirmation
            toast({
              title: "Payment Processing",
              description: "Your payment is being processed. You'll be notified once confirmed.",
            });

            // Log payment initiation success
            await auditLogger.logPaymentEvent(
              AuditAction.PAYMENT_INITIATED,
              transaction.id,
              product.price,
              {
                orderId: order.id,
                reference: response.reference,
                status: 'webhook_pending'
              }
            );

            // Poll for webhook processing completion
            setTimeout(() => {
              checkPaymentConfirmation(order.id);
            }, 3000);

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
      
      await auditLogger.logPaymentEvent(
        AuditAction.PAYMENT_FAILED,
        `failed_${Date.now()}`,
        product.price,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          productId: product.id
        }
      );
      
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const checkPaymentConfirmation = async (orderId: string) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      if (order.status === 'paid') {
        toast({
          title: "Payment Confirmed!",
          description: "Your purchase has been confirmed and processed.",
        });
        onSuccess();
      } else if (order.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      } else {
        // Still pending, check again after a delay
        setTimeout(() => {
          checkPaymentConfirmation(orderId);
        }, 5000);
      }
    } catch (error) {
      console.error('Error in payment confirmation check:', error);
    }
  };

  return {
    loading,
    processPayment
  };
};
