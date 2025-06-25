
import React from 'react';
import { Button } from '@/components/ui/button';
import { type Product } from '../ProductCard';

type PaymentButtonProps = {
  product: Product;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({ product, loading, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

export default PaymentButton;
