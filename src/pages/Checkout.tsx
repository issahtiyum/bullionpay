
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CheckoutForm from '@/components/ui/CheckoutForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useProducts } from '@/hooks/useProducts';
import { useEffect } from 'react';

const Checkout = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts();
  
  const product = products?.find(p => p.id === product_id);
  
  // Add logging to help debug issues
  useEffect(() => {
    console.log('Checkout page mounted:', { product_id, products, product });
  }, [product_id, products, product]);
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading product...</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }
  
  if (error) {
    console.error('Error loading products:', error);
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Error</h1>
            <p className="mb-6 text-gray-600">There was an error loading the product.</p>
            <Link to="/" className="text-bullion-purple-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }
  
  if (!product) {
    console.error('Product not found:', { product_id, available_products: products?.map(p => p.id) });
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
            <p className="mb-6 text-gray-600">The product you're trying to checkout doesn't exist.</p>
            <Link to="/" className="text-bullion-purple-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }
  
  const handlePaymentSuccess = () => {
    console.log('Payment successful, navigating to dashboard');
    navigate('/dashboard');
  };
  
  return (
    <ProtectedRoute>
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
                <span>GHS {Number(product.price).toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {product.category}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-bullion-purple">GHS {Number(product.price).toFixed(2)}</span>
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
    </ProtectedRoute>
  );
};

export default Checkout;
