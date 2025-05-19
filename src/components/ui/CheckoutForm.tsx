
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type Product } from './ProductCard';
import { useToast } from '@/hooks/use-toast';

type CheckoutFormProps = {
  product: Product;
  onPaymentSuccess: () => void;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ product, onPaymentSuccess }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || mobileNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid mobile money number",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate payment process for now
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Payment successful",
        description: "Your order has been placed successfully!",
      });
      onPaymentSuccess();
    }, 2000);
    
    // TODO: Implement actual Flutterwave payment integration
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mobileNumber">Mobile Money Number</Label>
        <Input
          id="mobileNumber"
          type="tel"
          placeholder="Enter your mobile money number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
          minLength={10}
          maxLength={10}
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
    </form>
  );
};

export default CheckoutForm;
