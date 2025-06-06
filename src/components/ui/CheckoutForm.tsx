
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type Product } from './ProductCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type CheckoutFormProps = {
  product: Product;
  onPaymentSuccess: () => void;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ product, onPaymentSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const generateReference = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `bullion_${timestamp}_${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // First, get the Paystack public key from our edge function
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-paystack-key');
      
      if (keyError || !keyData?.publicKey) {
        throw new Error('Failed to get payment configuration');
      }

      const reference = generateReference();
      const amountInKobo = Math.round(product.price * 100); // Convert to kobo

      // Load Paystack script dynamically and initialize payment
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.onload = () => {
        // @ts-ignore - Paystack is loaded globally
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: keyData.publicKey, // Use the key from our edge function
          email,
          amount: amountInKobo,
          reference,
          currency: 'GHS',
          callback: async (response: any) => {
            setLoading(false);
            
            if (response.status === 'success') {
              try {
                // Create transaction record FIRST
                const { data: transaction, error: transactionError } = await supabase
                  .from('transactions')
                  .insert({
                    user_id: user.id,
                    reference,
                    amount: product.price,
                    status: 'pending',
                    paystack_reference: response.reference,
                  })
                  .select()
                  .single();

                if (transactionError) {
                  console.error('Transaction creation error:', transactionError);
                  throw new Error('Failed to create transaction record');
                }

                console.log('Transaction created:', transaction);

                // Now verify payment on backend
                const { data, error } = await supabase.functions.invoke('verify-payment', {
                  body: {
                    reference: response.reference,
                    user_id: user.id,
                  },
                });

                if (error) {
                  console.error('Verification error:', error);
                  throw error;
                }

                console.log('Verification response:', data);

                if (data.success) {
                  // Create order record only after successful verification
                  const { error: orderError } = await supabase
                    .from('orders')
                    .insert({
                      user_id: user.id,
                      transaction_id: transaction.id,
                      product_id: product.id,
                      product_name: product.name,
                      product_category: product.category,
                      amount: product.price,
                      status: 'paid',
                      is_subscription: product.category === 'Subscription',
                      next_billing_date: product.category === 'Subscription' 
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        : null,
                    });

                  if (orderError) {
                    console.error('Order creation error:', orderError);
                    toast({
                      title: "Order creation failed",
                      description: "Payment was successful but order creation failed. Please contact support.",
                      variant: "destructive",
                    });
                    return;
                  }

                  toast({
                    title: "Payment successful",
                    description: "Your order has been placed successfully!",
                  });
                  onPaymentSuccess();
                } else {
                  toast({
                    title: "Payment verification failed",
                    description: "Please contact support if you were charged.",
                    variant: "destructive",
                  });
                }
              } catch (verifyError) {
                console.error('Payment processing error:', verifyError);
                toast({
                  title: "Payment processing failed",
                  description: "Please contact support if you were charged.",
                  variant: "destructive",
                });
              }
            } else {
              toast({
                title: "Payment cancelled",
                description: "Your payment was not completed.",
                variant: "destructive",
              });
            }
          },
          onClose: () => {
            setLoading(false);
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process.",
            });
          },
        });
      };
      
      script.onerror = () => {
        setLoading(false);
        toast({
          title: "Payment failed",
          description: "Failed to load payment system. Please try again.",
          variant: "destructive",
        });
      };
      
      document.head.appendChild(script);

    } catch (error) {
      setLoading(false);
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-bullion-purple-200 focus:border-bullion-purple-500"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-bullion hover:opacity-90"
        disabled={loading}
      >
        {loading ? 'Processing...' : `Pay Now - GHS ${product.price.toFixed(2)}`}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        Secure payment powered by Paystack
      </div>
    </form>
  );
};

export default CheckoutForm;
