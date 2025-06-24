
import { supabase } from '@/integrations/supabase/client';
import { generatePaymentReference, convertToKobo, loadPaystackScript } from '@/utils/paymentUtils';
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
        
        if (response.status === 'success') {
          await onSuccess(response, reference);
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
