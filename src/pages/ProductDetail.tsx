
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import CategoryBadge from '@/components/ui/CategoryBadge';
import { type Product } from '@/components/ui/ProductCard';

// Sample products data - in a real app would come from API
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Netflix Basic',
    category: 'Subscription',
    price: 50.00,
    image: '/placeholder.svg',
  },
  {
    id: '2',
    name: 'Amazon Gift Card',
    category: 'Gift Card',
    price: 100.00,
    image: '/placeholder.svg',
  },
  {
    id: '3',
    name: 'Xbox Game Pass',
    category: 'Game Credit',
    price: 75.00,
    image: '/placeholder.svg',
  },
  {
    id: '4',
    name: 'Spotify Premium',
    category: 'Subscription',
    price: 30.00,
    image: '/placeholder.svg',
  },
  {
    id: '5',
    name: 'Steam Wallet',
    category: 'Game Credit',
    price: 150.00,
    image: '/placeholder.svg',
  },
  {
    id: '6',
    name: 'iTunes Gift Card',
    category: 'Gift Card',
    price: 80.00,
    image: '/placeholder.svg',
  },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const product = sampleProducts.find(p => p.id === id);
  
  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <p className="mb-6 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover aspect-square"
            />
          </div>
          
          {/* Product Details */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <CategoryBadge category={product.category} />
            </div>
            
            <p className="text-2xl font-semibold text-bullion-purple mb-4">
              GHS {product.price.toFixed(2)}
            </p>
            
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Service Description</h3>
                <p className="text-gray-700 mb-4">
                  {product.category === 'Subscription' 
                    ? '1 month subscription plan with full access to all features.'
                    : product.category === 'Gift Card'
                    ? 'Digital gift card with full value that can be redeemed immediately.'
                    : 'Game credits that can be used for in-game purchases or subscriptions.'
                  }
                </p>
                
                <h3 className="font-semibold mb-2">Delivery Information</h3>
                <p className="text-gray-700">
                  Delivered in 24 hours via dashboard/email once payment is confirmed.
                </p>
                
                <div className="mt-4 p-3 bg-bullion-blue-50 text-bullion-blue-800 rounded-md text-sm">
                  <p>Note: Delivery is currently handled manually. You'll receive your digital product 
                  within 24 hours of purchase.</p>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-bullion hover:opacity-90"
              onClick={() => navigate(`/checkout/${product.id}`)}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
