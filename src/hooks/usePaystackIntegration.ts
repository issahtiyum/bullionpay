
import { supabase } from '@/integrations/supabase/client';
import { generatePaymentReference, convertToKobo, loadPaystackScript } from '@/utils/paymentUtils';
import { sanitizeText } from '@/utils/sanitizer';
import { type Product } from '@/components/ui/ProductCard';
import { useToast } from '@/hooks/use-toast';

export const usePaystackIntegration = () => {
  const { toast } = useToast();

  const initializePaystackPayment = async (
    product: Product,
    email: string,
    onSuccess: (response: any, reference: string) => Promise<void>,
    onClose: () => void
  ) => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeText(email.trim());
    
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      throw new Error('Invalid email address provided');
    }

    // Validate product data
    if (!product || !product.id || !product.price || product.price <= 0) {
      throw new Error('Invalid product data');
    }

    // Get the Paystack public key and current mode
    const { data: keyData, error: keyError } = await supabase.functions.invoke('get-paystack-key');
    
    if (keyError || !keyData?.publicKey) {
      console.error('Failed to get Paystack key:', keyError);
      throw new Error('Failed to get payment configuration');
    }

    const mode = (keyData.mode === 'test' || keyData.mode === 'live') ? keyData.mode : 'live';
    const reference = generatePaymentReference(mode);
    const amountInKobo = convertToKobo(product.price);

    // Validate amount
    if (amountInKobo < 100) { // Minimum 1 GHS
      throw new Error('Amount too small for payment processing');
    }

    // Load Paystack script and initialize payment
    await loadPaystackScript();
    
    // @ts-ignore - Paystack is loaded globally
    if (typeof window.PaystackPop === 'undefined') {
      throw new Error('Payment system failed to load');
    }
    
    // @ts-ignore - Paystack is loaded globally
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: keyData.publicKey,
      email: sanitizedEmail,
      amount: amountInKobo,
      reference,
      currency: 'GHS',
      callback: async (response: any) => {
        console.log('Paystack callback response:', response);
        
        try {
          if (response.status === 'success' && response.reference) {
            await onSuccess(response, reference);
          } else {
            console.log('Payment was not successful:', response);
            toast({
              title: "Payment cancelled",
              description: "Your payment was not completed.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Payment success handler error:', error);
          toast({
            title: "Payment processing error",
            description: "There was an error processing your payment. Please contact support.",
            variant: "destructive",
          });
        }
      },
      onClose: () => {
        console.log('Payment popup closed by user');
        onClose();
        toast({
          title: "Payment cancelled",
          description: "You cancelled the payment process.",
        });
      },
    });
  };

  return { initializePaystackPayment };
};
