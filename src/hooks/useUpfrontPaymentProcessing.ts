
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
import { getPaystackConfig } from '@/services/paymentConfigService';

export const useUpfrontPaymentProcessing = (product: Product, onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { initializePaystackPayment } = usePaystackIntegration();
  const { createTransaction, verifyPayment } = useTransactionManager();
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
      console.log('Starting upfront payment process for product:', product.name);
      
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

      // Fetch current payment mode from config
      const { mode } = await getPaystackConfig();
      console.log('Current payment mode:', mode);
      
      // Generate reference upfront with correct mode
      const reference = `ps_${mode}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

      // Create transaction record BEFORE payment
      console.log('Creating transaction upfront with reference:', reference);
      const transaction = await createTransaction(product, reference, reference);
      console.log('Transaction created upfront:', transaction);

      // Create order record BEFORE payment
      // NOTE: Custom field data is NOT stored until payment is confirmed (to save database space)
      // It will be added by the webhook handler after successful payment
      const orderData = {
        user_id: user.id,
        transaction_id: transaction.id,
        product_id: product.id,
        product_name: sanitizeText(product.name),
        product_category: sanitizeText(product.category),
        amount: product.price,
        status: 'pending',
        is_subscription: product.category === 'Subscription',
        is_test: mode === 'test', // Explicitly set based on current mode
        next_billing_date: product.category === 'Subscription' 
          ? new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
          : null,
        custom_field_data: {}, // Empty until payment confirmed - saves database space for abandoned carts
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

      console.log('Order created upfront:', order);
      setOrderId(order.id);

      // Initialize Paystack payment with pre-created reference
      await initializePaystackPayment(
        product,
        sanitizedEmail,
        async (response) => {
          try {
            console.log('Payment callback received:', response);
            
            if (!response.reference || !response.status) {
              throw new Error('Invalid payment response');
            }

            // Update transaction with paystack reference
            const { error: updateError } = await supabase
              .from('transactions')
              .update({
                paystack_reference: response.reference,
                updated_at: new Date().toISOString(),
              })
              .eq('id', transaction.id);

            if (updateError) {
              console.error('Failed to update transaction with paystack reference:', updateError);
            }

            // Show awaiting confirmation state
            setAwaitingConfirmation(true);
            setLoading(false);

            toast({
              title: "Payment Submitted",
              description: "Awaiting payment confirmation...",
            });

            // Start polling for payment confirmation
            setTimeout(() => {
              checkPaymentConfirmation(order.id);
            }, 2000);

          } catch (error) {
            console.error('Payment processing error:', error);
            setAwaitingConfirmation(false);
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
          setAwaitingConfirmation(false);
          toast({
            title: "Payment cancelled",
            description: "You cancelled the payment process.",
          });
        },
        reference // Pass the pre-generated reference
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
      setAwaitingConfirmation(false);
    }
  };

  const checkPaymentConfirmation = async (orderIdToCheck: string) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderIdToCheck)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      if (order.status === 'paid') {
        setAwaitingConfirmation(false);
        toast({
          title: "Payment Confirmed!",
          description: "Your purchase has been confirmed and processed.",
        });
        onSuccess();
      } else if (order.status === 'failed') {
        setAwaitingConfirmation(false);
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      } else {
        // Still pending, check again after a delay
        setTimeout(() => {
          checkPaymentConfirmation(orderIdToCheck);
        }, 5000);
      }
    } catch (error) {
      console.error('Error in payment confirmation check:', error);
    }
  };

  const verifyPaymentNow = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      
      // Get the transaction reference for this order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('transaction_id')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('paystack_reference')
        .eq('id', order.transaction_id)
        .single();

      if (txError || !transaction) {
        throw new Error('Transaction not found');
      }

      // Verify payment using the secure endpoint
      await verifyPayment(transaction.paystack_reference);
      
      // Check status again
      await checkPaymentConfirmation(orderId);
      
      toast({
        title: "Verification Requested",
        description: "Payment verification initiated. Please wait...",
      });
    } catch (error) {
      console.error('Manual verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    awaitingConfirmation,
    processPayment,
    verifyPaymentNow
  };
};
