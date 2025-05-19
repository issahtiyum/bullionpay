
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CheckoutForm from '@/components/ui/CheckoutForm';
import { Product } from '@/components/ui/ProductCard';

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

const Checkout = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const navigate = useNavigate();
  
  const product = sampleProducts.find(p => p.id === product_id);
  
  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <p className="mb-6 text-gray-600">The product you're trying to checkout doesn't exist.</p>
          <Link to="/" className="text-bullion-purple-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  const handlePaymentSuccess = () => {
    // In a real app, we would redirect to a success page or dashboard
    // For now, let's redirect to the dashboard
    navigate('/dashboard');
  };
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link 
            to={`/product/${product.id}`}
            className="text-bullion-purple inline-flex items-center hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to product
          </Link>
        </div>
        
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{product.name}</span>
              <span>GHS {product.price.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {product.category}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-bullion-purple">GHS {product.price.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm 
              product={product}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Checkout;
